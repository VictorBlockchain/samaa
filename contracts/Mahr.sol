pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";



/// Minimal interface to query XFT settings from storage
interface IXFTStorage {
    struct XFT {
        uint256 id;
        uint256[] settings;
        address[] addresses;
        string tokenURI;
    }

    function getXFT(uint256 xftId, address xft_contract)
        external
        view
        returns (XFT memory, uint256[] memory, uint256[] memory);
}

/**
 * Mahr contract
 * Holds an ERC‑1155 xftContract as proof of seriousness for marriage.
 * - depositMahr: depositor transfers an xftContract (with amount) into the contract; sets a minimum lock of 45 days.
 * - withdrawMahr: depositor can withdraw the xftContract after unlock date if not transferred.
 * - transferMahr: depositor transfers the xftContract to the bride.
 * - updateWithdrawDate (admin): owner can push the unlock date later as a penalty for inactivity.
 */
contract Mahr is Ownable, ReentrancyGuard, ERC1155Receiver {
    struct MahrRecord {
        address xft;
        uint256 xftId;
        uint256 amount;
        address suitor;
        address bride;
        address vault;
        uint256 depositedAt;
        uint256 unlockDate;
        bool accepted;
        bool transferred;
        bool withdrawn;
        bool returned;
    }

    // Minimum lock period: 45 days
    uint256 public constant MIN_LOCK_PERIOD = 45 days;
    // Absolute cap: unlock date must be within one year from now
    uint256 public constant MAX_UNLOCK_PERIOD = 365 days;
    // Only ERC-1155 tokens from this contract are accepted
    address public XFT = 0x0000000000000000000000000000000000000000;
    // XFT storage contract used to read token settings
    address public XFT_STORAGE = 0x0000000000000000000000000000000000000000;

    // Support multiple deposits per suitor
    mapping(address => mapping(uint256 => MahrRecord)) public mahr; // suitor => xftId => Mahr record
    mapping(uint256 => MahrRecord) public xftIdToMahr; // global index by xftId
    mapping(uint256 => address) public xftIdToSuitor; // xftId => suitor
    mapping(address => uint256[]) public suitorToXftId; // suitor => list of xftIds
    mapping(address => uint256[]) public brideToXftId; // bride => list of xftIds
    mapping(address => bool) public isAdmin; // admin => isAdmin

    event MahrDeposited(address indexed depositor, address indexed bride, address indexed xftContract, uint256 xftId, uint256 amount, uint256 unlockDate);
    event MahrWithdrawn(address indexed depositor, address indexed xftContract, uint256 xftId, uint256 amount);
    event MahrTransferred(address indexed depositor, address indexed bride, address indexed xftContract, uint256 xftId, uint256 amount);
    event MahrAccepted(address indexed suitor, address indexed bride, address indexed xftContract, uint256 xftId, uint256 amount);
    event BrideUpdated(address indexed suitor, address indexed bride, address indexed xftContract, uint256 xftId);
    event MahrAcceptanceRejected(address indexed suitor, address indexed xftContract, uint256 xftId);
    event MahrReturned(address indexed bride, address indexed suitor, address indexed xftContract, uint256 xftId, uint256 amount);
    event WithdrawDateUpdated(address indexed depositor, uint256 oldUnlockDate, uint256 newUnlockDate);
    event XFTUpdated(address indexed oldXFT, address indexed newXFT);
    event XFTStorageUpdated(address indexed oldStorage, address indexed newStorage);
    event MahrVaultUpdated(address indexed oldVault, address indexed newVault);

    constructor(address xftContract, address xftStorage) Ownable(msg.sender) {
        isAdmin[msg.sender] = true;
        XFT = xftContract;
        XFT_STORAGE = xftStorage;
    }
    modifier onlyAdmin() {
        require(isAdmin[msg.sender], "Not admin");
        _;
    }
    /**
     * Deposits an ERC‑1155 xftContract as mahr. Caller transfers `amount` of `xftId` to this contract.
     * @param xftContract ERC‑1155 contract address
     * @param xftId token id to deposit
     * @param amount amount of the token id to deposit (must be > 0)
     * Bride is not selected at deposit; she is set during transfer.
     */
    function depositMahr(uint256 xftId) external nonReentrant {
        require(XFT != address(0), "XFT not set");
        require(XFT_STORAGE != address(0), "XFT storage not set");

        // Validate XFT settings from storage: type (settings[3]) == 8 and quantity (settings[6]) == 1
        (IXFTStorage.XFT memory xftData, , ) = IXFTStorage(XFT_STORAGE).getXFT(xftId, XFT);
        require(xftData.settings.length > 6, "Invalid settings");
        require(xftData.settings[3] == 8, "XFT must be type 8");
        require(xftData.settings[6] == 1, "XFT quantity must be 1");

        // Read vault from XFT storage (addresses[2]) and enforce if required
        address vaultAddr = address(0);
        if (xftData.addresses.length > 2) {
            vaultAddr = xftData.addresses[2];
        }
        require(vaultAddr != address(0), "Vault not set");

        // Prevent duplicate deposit for the same XFT id globally
        require(xftIdToSuitor[xftId] == address(0), "XFT already deposited");

        // Verify ownership and operator approval before pulling the ERC-1155 token
        require(IERC1155(XFT).balanceOf(msg.sender, xftId) == 1, "Insufficient XFT balance");
        require(IERC1155(XFT).isApprovedForAll(msg.sender, address(this)), "Approve contract as operator");

        // Transfer ERC‑1155 tokens from depositor to this contract
        IERC1155(XFT).safeTransferFrom(msg.sender, address(this), xftId, 1, "");

        uint256 unlockDate = block.timestamp + MIN_LOCK_PERIOD;
        MahrRecord memory dep = MahrRecord({
            xft: XFT,
            xftId: xftId,
            amount: amount,
            suitor: msg.sender,
            bride: address(0),
            vault: vaultAddr,
            depositedAt: block.timestamp,
            unlockDate: unlockDate,
            accepted: false,
            transferred: false,
            withdrawn: false,
            returned: false
        });

        // Index deposit
        mahr[msg.sender][xftId] = dep;
        xftIdToMahr[xftId] = dep;
        xftIdToSuitor[xftId] = msg.sender;
        suitorToXftId[msg.sender].push(xftId);

        emit MahrDeposited(msg.sender, address(0), XFT, xftId, amount, unlockDate);
    }

    /**
     * Admin: set the XFT storage contract to validate deposits.
     */
    function setXFTStorage(address newStorage) external onlyAdmin {
        require(newStorage != address(0), "Invalid storage");
        address old = XFT_STORAGE;
        XFT_STORAGE = newStorage;
        emit XFTStorageUpdated(old, newStorage);
    }

    /**
     * Withdraws the mahr xftContract back to the depositor after the unlock date.
     * Fails if the xftContract has already been transferred to the bride.
     */
    function withdrawMahr(uint256 xftId) external nonReentrant {
        MahrRecord storage d = mahr[msg.sender][xftId];
        require(_hasActiveMahr(d), "No active mahr");
        require(!d.transferred, "Already transferred");
        require(!d.withdrawn, "Already withdrawn");
        require(block.timestamp >= d.unlockDate, "Withdraw locked");

        d.withdrawn = true;
        IERC1155(d.xft).safeTransferFrom(address(this), msg.sender, d.xftId, d.amount, "");

        emit MahrWithdrawn(msg.sender, d.xft, d.xftId, d.amount);
        delete mahr[msg.sender][xftId];
        delete xftIdToMahr[xftId];
        delete xftIdToSuitor[xftId];
    }

    function acceptMahr(address suitor, uint256 xftId) external nonReentrant {
        require(suitor != address(0), "Invalid suitor");
        require(msg.sender != suitor, "Suitor cannot accept");
        MahrRecord storage d = mahr[suitor][xftId];
        require(_hasActiveMahr(d), "No active mahr");
        require(!d.transferred, "Already transferred");
        require(!d.withdrawn, "Already withdrawn");
        require(!d.accepted, "Already accepted");
        require(d.bride != address(0), "Bride not set");
        require(msg.sender == d.bride, "Only selected bride");

        d.bride = msg.sender;
        d.accepted = true;
        emit MahrAccepted(suitor, msg.sender, d.xft, d.xftId, d.amount);
    }
    /**
     * Transfers the mahr xftContract to the bride, setting the bride at transfer time.
     * Only the original depositor can execute this.
     */
    function transferMahr(uint256 xftId) external nonReentrant {
        MahrRecord storage d = mahr[msg.sender][xftId];
        require(_hasActiveMahr(d), "No active mahr");
        require(d.accepted && d.bride != address(0), "Bride must accept first");
        require(!d.transferred, "Already transferred");
        require(!d.withdrawn, "Already withdrawn");

        d.transferred = true;
        IERC1155(d.xft).safeTransferFrom(address(this), d.bride, d.xftId, d.amount, "");
        brideToXftId[d.bride].push(xftId);
        emit MahrTransferred(msg.sender, d.bride, d.xft, d.xftId, d.amount);

    }

    function setBride(uint256 xftId, address bride) external nonReentrant {
        MahrRecord storage d = mahr[msg.sender][xftId];
        require(_hasActiveMahr(d), "No active mahr");
        require(!d.withdrawn, "Already withdrawn");
        require(!d.transferred, "Already transferred");
        require(!d.accepted, "Already accepted");
        d.bride = bride;
        emit BrideUpdated(msg.sender, bride, d.xft, d.xftId);
    }

    function rejectAcceptance(uint256 xftId) external nonReentrant {
        MahrRecord storage d = mahr[msg.sender][xftId];
        require(_hasActiveMahr(d), "No active mahr");
        require(d.accepted, "Not accepted");
        require(!d.transferred, "Already transferred");
        require(!d.withdrawn, "Already withdrawn");

        d.accepted = false;
        d.bride = address(0);
        emit MahrAcceptanceRejected(msg.sender, d.xft, d.xftId);
    }

    function returnMahr(address suitor, uint256 xftId) external nonReentrant {
        require(suitor != address(0), "Invalid suitor");
        MahrRecord storage d = mahr[suitor][xftId];
        require(_hasActiveMahr(d), "No active mahr");
        require(d.transferred, "Not transferred");
        require(!d.withdrawn, "Already withdrawn");
        require(msg.sender == d.bride, "Only bride can return");
        // Require operator approval to move ERC1155 from bride back to escrow
        require(IERC1155(d.xft).isApprovedForAll(msg.sender, address(this)), "Approve contract as operator");

        IERC1155(d.xft).safeTransferFrom(msg.sender, address(this), d.xftId, d.amount, "");
        d.transferred = false;
        d.accepted = false;
        d.bride = address(0);
        d.returned = true;
        emit MahrReturned(msg.sender, suitor, d.xft, d.xftId, d.amount);
    }

    /**
     * Admin: push the unlock date later as a penalty for inactivity.
     * - Capped at a maximum of 45 days from now.
     * - Must also be within one year from the current date.
     * @param depositor address that owns the deposit
     * @param newUnlockDate new unlock timestamp (must be in the future, <= now + 45 days, <= now + 1 year, and >= current unlock)
     */
    function updateWithdrawDate(address suitor, uint256 xftId, uint256 newUnlockDate) external onlyAdmin {
        require(suitor != address(0), "Invalid suitor");
        MahrRecord storage d = mahr[suitor][xftId];
        require(_hasActiveMahr(d), "No active mahr");
        require(!d.transferred && !d.withdrawn, "Deposit closed");
        require(newUnlockDate > block.timestamp, "Unlock must be future");
        require(newUnlockDate <= block.timestamp + MIN_LOCK_PERIOD, "Unlock exceeds max 45 days");
        require(newUnlockDate <= block.timestamp + MAX_UNLOCK_PERIOD, "Unlock exceeds 1 year");
        require(newUnlockDate >= d.unlockDate, "Cannot reduce unlock");
        
        uint256 old = d.unlockDate;
        d.unlockDate = newUnlockDate;
        emit WithdrawDateUpdated(suitor, old, newUnlockDate);
    }

    /**
     * View helper to read a user's active deposit details.
     */
    function getMahr(address suitor, uint256 xftId) external view returns (MahrRecord memory) {
        return mahr[suitor][xftId];
    }

    /**
     * View helper: list all XFT xftIds deposited by a suitor.
     */
    function getSuitorMahrs(address suitor) external view returns (uint256[] memory) {
        return suitorToXftId[suitor];
        }

    /**
     * View helper: returns MahrRecord[] aligned with suitorToXftId for a suitor.
     * Each index corresponds to the same index in getSuitorMahrs(suitor).
     * Note: entries for closed mahr may be zeroed records if arrays are not pruned.
     */
    function getSuitorMahrRecords(address suitor) external view returns (MahrRecord[] memory) {
        uint256[] storage ids = suitorToXftId[suitor];
        MahrRecord[] memory records = new MahrRecord[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            records[i] = mahr[suitor][ids[i]];
        }
        return records;
    }

    /**
     * View helper: list all XFT xftIds associated to a bride via transfers.
     */
    function getBrideMahrs(address bride) external view returns (uint256[] memory) {
        return brideToXftId[bride];
    }

    function getBrideMahrRecords(address bride) external view returns (MahrRecord[] memory) {
        uint256[] storage ids = brideToXftId[bride];
        MahrRecord[] memory records = new MahrRecord[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            address suitor = xftIdToSuitor[ids[i]];
            records[i] = mahr[suitor][ids[i]];
        }
        return records;
    }

    function _hasActiveMahr(MahrRecord storage d) internal view returns (bool) {
        return d.xft != address(0) && d.amount > 0 && !d.transferred && !d.withdrawn;
    }

    function setAdmin(address admin, bool is) external onlyAdmin {
        isAdmin[admin] = is;
    }
 
    // ERC‑1155 receiver support
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC1155Receiver)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}