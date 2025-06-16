"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Wallet, Sparkles, Copy, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CelestialBackground } from "@/components/ui/celestial-background"

interface NFTWallet {
  id: string
  name: string
  type: "dowry" | "purse"
  image: string
  address: string
  solBalance: number
  samaaBalance: number
  mintDate: string
}

const DOWRY_NFTS = [
  {
    id: "cow",
    name: "Sacred Cow",
    description: "Traditional dowry representing prosperity and abundance",
    image: "/placeholder.svg?height=200&width=200",
    price: 0.1,
  },
  {
    id: "ring",
    name: "Diamond Ring",
    description: "Symbol of eternal love and commitment",
    image: "/placeholder.svg?height=200&width=200",
    price: 0.05,
  },
  {
    id: "house",
    name: "Family Home",
    description: "Foundation for building a blessed family",
    image: "/placeholder.svg?height=200&width=200",
    price: 0.5,
  },
  {
    id: "car",
    name: "Luxury Vehicle",
    description: "Modern convenience for the family journey",
    image: "/placeholder.svg?height=200&width=200",
    price: 0.2,
  },
]

const PURSE_NFTS = [
  {
    id: "jewelry-box",
    name: "Jewelry Box",
    description: "Elegant storage for precious treasures",
    image: "/placeholder.svg?height=200&width=200",
    price: 0.05,
  },
  {
    id: "silk-purse",
    name: "Silk Purse",
    description: "Luxurious purse for the modern woman",
    image: "/placeholder.svg?height=200&width=200",
    price: 0.08,
  },
  {
    id: "golden-chest",
    name: "Golden Chest",
    description: "Secure storage for family wealth",
    image: "/placeholder.svg?height=200&width=200",
    price: 0.3,
  },
  {
    id: "pearl-case",
    name: "Pearl Case",
    description: "Delicate case for life's precious moments",
    image: "/placeholder.svg?height=200&width=200",
    price: 0.15,
  },
]

export function WalletView() {
  const [activeTab, setActiveTab] = useState<"mint" | "wallet">("mint")
  const [userGender, setUserGender] = useState<"male" | "female">("male") // This would come from user profile
  const [ownedWallets, setOwnedWallets] = useState<NFTWallet[]>([
    {
      id: "1",
      name: "Sacred Cow",
      type: "dowry",
      image: "/placeholder.svg?height=200&width=200",
      address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHRs",
      solBalance: 2.5,
      samaaBalance: 1000,
      mintDate: "2024-01-15",
    },
  ])

  const router = useRouter()
  const { connected, publicKey } = useWallet()

  const nftOptions = userGender === "male" ? DOWRY_NFTS : PURSE_NFTS

  const handleMint = async (nftId: string) => {
    // Simulate minting process
    const nft = nftOptions.find((n) => n.id === nftId)
    if (!nft) return

    const newWallet: NFTWallet = {
      id: Date.now().toString(),
      name: nft.name,
      type: userGender === "male" ? "dowry" : "purse",
      image: nft.image,
      address: `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      solBalance: 0,
      samaaBalance: 0,
      mintDate: new Date().toISOString().split("T")[0],
    }

    setOwnedWallets((prev) => [...prev, newWallet])
    setActiveTab("wallet")
  }

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
  }

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  return (
    <div className="min-h-screen relative">
      <CelestialBackground />
      <div className="relative z-10 bg-gradient-to-br from-indigo-50/80 via-white/80 to-purple-50/80 min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-indigo-100/50">
          <div className="flex items-center justify-between p-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-indigo-50 rounded-xl transition-colors">
              <ArrowLeft className="w-6 h-6 text-indigo-600" />
            </button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-slate-800 font-qurova">
                {userGender === "male" ? "Dowry Wallet" : "Purse Wallet"}
              </h1>
              <p className="text-sm text-slate-600 font-queensides">
                {userGender === "male" ? "Mint & manage dowry NFTs" : "Mint & manage purse NFTs"}
              </p>
            </div>
            <div className="w-10" /> {/* Spacer */}
          </div>

          {/* Tabs */}
          <div className="flex px-4 pb-4">
            <div className="flex bg-indigo-50 rounded-2xl p-1 w-full">
              {["mint", "wallet"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as "mint" | "wallet")}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                    activeTab === tab
                      ? "bg-white text-indigo-600 shadow-sm font-qurova"
                      : "text-slate-600 hover:text-indigo-600 font-queensides"
                  }`}
                >
                  {tab === "mint" ? "Mint NFT" : "My Wallet"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pb-32">
          <AnimatePresence mode="wait">
            {activeTab === "mint" ? (
              <motion.div
                key="mint"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Enhanced Wallet Type Selection */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="relative group mb-6"
                >
                  <div className="relative rounded-2xl p-6 border-2 border-indigo-300/20 hover:border-indigo-400/40 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-gradient-to-br from-white/5 to-indigo-50/10">
                    {/* Arabic-inspired corner decorations */}
                    <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-indigo-400/60 rounded-tl-lg"></div>
                    <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-purple-400/60 rounded-tr-lg"></div>
                    <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-purple-400/60 rounded-bl-lg"></div>
                    <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-indigo-400/60 rounded-br-lg"></div>

                    <div className="relative z-10">
                      {/* Section Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center border border-indigo-200/50">
                            <Sparkles className="w-5 h-5 text-indigo-600" />
                          </div>
                          <span className="text-lg font-bold text-slate-800 font-qurova">Smart NFT Wallet Type</span>
                        </div>

                        <div className="flex bg-white/80 backdrop-blur-sm rounded-xl p-1 border border-indigo-200/50">
                          {["male", "female"].map((gender) => (
                            <button
                              key={gender}
                              onClick={() => setUserGender(gender as "male" | "female")}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                                userGender === gender
                                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                                  : "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                              }`}
                            >
                              {gender === "male" ? "Dowry" : "Purse"}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Enhanced Description */}
                      <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-xl p-4 border border-indigo-200/30">
                        <p className="text-sm text-slate-700 font-queensides leading-relaxed">
                          {userGender === "male" ? (
                            <>
                              <span className="font-semibold text-indigo-600">Dowry Smart NFTs</span> are special NFTs that can hold assets in a secure vault.
                              Mint one to offer to your future wife with time-lock controls for marriage ceremonies.
                            </>
                          ) : (
                            <>
                              <span className="font-semibold text-purple-600">Purse Smart NFTs</span> are special NFTs that can hold assets in a secure vault.
                              Mint one to receive and manage your funds with owner-only access controls.
                            </>
                          )}
                        </p>

                        {/* Smart NFT Features */}
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-queensides">🔒 Vault Address</span>
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-queensides">⏰ Time Lock</span>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-queensides">👤 Owner Only</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* NFT Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {nftOptions.map((nft) => (
                    <motion.div key={nft.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Card className="p-4 hover:shadow-lg transition-all duration-300 border-indigo-200/50">
                        <div className="aspect-square mb-3 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100">
                          <img
                            src={nft.image || "/placeholder.svg"}
                            alt={nft.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <h3 className="font-bold text-slate-800 font-qurova mb-1">{nft.name}</h3>
                        <p className="text-xs text-slate-600 font-queensides mb-3 line-clamp-2">{nft.description}</p>

                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-indigo-600 font-qurova">{nft.price} SOL</span>
                          <Button
                            onClick={() => handleMint(nft.id)}
                            size="sm"
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-queensides"
                            disabled={!connected}
                          >
                            <Sparkles className="w-4 h-4 mr-1" />
                            Mint
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {!connected && (
                  <Card className="p-4 mt-6 bg-amber-50 border-amber-200">
                    <div className="flex items-center space-x-3">
                      <Wallet className="w-5 h-5 text-amber-600" />
                      <div>
                        <p className="font-medium text-amber-800 font-qurova">Connect Wallet Required</p>
                        <p className="text-sm text-amber-700 font-queensides">
                          Please connect your wallet to mint NFTs
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="wallet"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {ownedWallets.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative group"
                  >
                    <div className="relative rounded-2xl p-8 border-2 border-indigo-300/20 hover:border-indigo-400/40 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-gradient-to-br from-white/5 to-indigo-50/10">
                      {/* Arabic-inspired corner decorations */}
                      <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-indigo-400/60 rounded-tl-xl"></div>
                      <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-purple-400/60 rounded-tr-xl"></div>
                      <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-purple-400/60 rounded-bl-xl"></div>
                      <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-indigo-400/60 rounded-br-xl"></div>

                      {/* Geometric pattern overlay */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 border border-indigo-300/30 rounded-full opacity-20"></div>
                      <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-purple-300/20 rounded-full"></div>
                      <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-indigo-300/20 rounded-full"></div>

                      <div className="relative z-10 text-center">
                        {/* Elegant Icon */}
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.3, duration: 0.6 }}
                          className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-200/50"
                        >
                          <Wallet className="w-10 h-10 text-indigo-600" />
                        </motion.div>

                        {/* Title */}
                        <h3 className="text-3xl font-bold text-slate-800 mb-4 font-qurova">
                          No Smart NFTs Yet
                        </h3>

                        {/* Elegant Description */}
                        <p className="text-lg text-slate-600 font-queensides leading-relaxed mb-6 max-w-sm mx-auto">
                          Mint your first
                          <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            {userGender === "male" ? " dowry Smart NFT" : " purse Smart NFT"}
                          </span> to get started with secure asset storage.
                        </p>

                        {/* Smart NFT Benefits */}
                        <div className="space-y-4 mb-6">
                          <p className="text-base text-indigo-600 font-queensides font-semibold">
                            What you'll get:
                          </p>

                          <div className="grid grid-cols-1 gap-3 max-w-xs mx-auto">
                            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200/50 shadow-sm">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm">🏦</span>
                                </div>
                                <span className="text-sm font-queensides text-slate-700 font-semibold">Secure vault address</span>
                              </div>
                            </div>

                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200/50 shadow-sm">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm">⏰</span>
                                </div>
                                <span className="text-sm font-queensides text-slate-700 font-semibold">Time lock controls</span>
                              </div>
                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200/50 shadow-sm">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm">👤</span>
                                </div>
                                <span className="text-sm font-queensides text-slate-700 font-semibold">Owner-only access</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Trust Indicators */}
                        <div className="flex justify-center space-x-4 text-sm mb-6">
                          <div className="flex items-center space-x-2 text-indigo-600">
                            <div className="w-2 h-2 bg-indigo-500/70 rounded-full"></div>
                            <span className="font-queensides">Secure & Private</span>
                          </div>
                          <div className="flex items-center space-x-2 text-purple-600">
                            <div className="w-2 h-2 bg-purple-500/70 rounded-full"></div>
                            <span className="font-queensides">Islamic Values</span>
                          </div>
                        </div>

                        <Button
                          onClick={() => setActiveTab("mint")}
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-queensides text-lg px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <Sparkles className="w-5 h-5 mr-2" />
                          Mint Smart NFT
                        </Button>
                      </div>

                      {/* Arabic-Inspired Card Divider */}
                      <div className="flex items-center justify-center mt-6">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-300/30 to-transparent"></div>
                        <div className="mx-4 flex items-center space-x-1">
                          <div className="w-1 h-1 bg-indigo-400/60 rounded-full"></div>
                          <div className="w-2 h-2 border border-indigo-400/40 rounded-full flex items-center justify-center">
                            <div className="w-0.5 h-0.5 bg-indigo-500/70 rounded-full"></div>
                          </div>
                          <div className="w-1 h-1 bg-purple-400/60 rounded-full"></div>
                        </div>
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-300/30 to-transparent"></div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-6">
                    {ownedWallets.map((wallet, index) => (
                      <motion.div
                        key={wallet.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="relative group"
                      >
                        <div className="relative rounded-2xl p-6 border-2 border-indigo-300/20 hover:border-indigo-400/40 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-gradient-to-br from-white/5 to-indigo-50/10">
                          {/* Arabic-inspired corner decorations */}
                          <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-indigo-400/60 rounded-tl-lg"></div>
                          <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-purple-400/60 rounded-tr-lg"></div>
                          <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-purple-400/60 rounded-bl-lg"></div>
                          <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-indigo-400/60 rounded-br-lg"></div>

                          <div className="relative z-10">
                            <div className="flex items-start space-x-4">
                              <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 flex-shrink-0 border border-indigo-200/50">
                                <img
                                  src={wallet.image || "/placeholder.svg"}
                                  alt={wallet.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-3">
                                  <div>
                                    <h3 className="text-lg font-bold text-slate-800 font-qurova">{wallet.name}</h3>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-queensides">Smart NFT</span>
                                      <span className="text-xs text-slate-500 font-queensides">Minted {wallet.mintDate}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Smart NFT Features */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-queensides">
                                    🏦 Vault Active
                                  </span>
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-queensides">
                                    🔐 Owner Access
                                  </span>
                                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-queensides">
                                    ⏰ Time Lock Ready
                                  </span>
                                </div>

                                {/* Vault Address */}
                                <div className="mb-4">
                                  <p className="text-sm font-semibold text-slate-700 font-queensides mb-2">Smart NFT Vault Address</p>
                                  <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-xl p-3 border border-indigo-200/30">
                                    <div className="flex items-center space-x-2">
                                      <code className="text-sm font-mono text-slate-700 flex-1 truncate">
                                        {shortenAddress(wallet.address)}
                                      </code>
                                      <button
                                        onClick={() => copyAddress(wallet.address)}
                                        className="p-2 hover:bg-indigo-100 rounded-lg transition-colors"
                                      >
                                        <Copy className="w-4 h-4 text-indigo-600" />
                                      </button>
                                      <button
                                        onClick={() =>
                                          window.open(
                                            `https://explorer.solana.com/address/${wallet.address}?cluster=devnet`,
                                            "_blank",
                                          )
                                        }
                                        className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                                      >
                                        <ExternalLink className="w-4 h-4 text-purple-600" />
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* Enhanced Balances */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200/50">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">◎</span>
                                      </div>
                                      <p className="text-sm text-indigo-700 font-queensides font-semibold">SOL Balance</p>
                                    </div>
                                    <p className="text-xl font-bold text-indigo-800 font-qurova">{wallet.solBalance.toFixed(4)}</p>
                                  </div>
                                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200/50">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">S</span>
                                      </div>
                                      <p className="text-sm text-purple-700 font-queensides font-semibold">SAMAA Balance</p>
                                    </div>
                                    <p className="text-xl font-bold text-purple-800 font-qurova">
                                      {wallet.samaaBalance.toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
