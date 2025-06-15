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
                {/* Gender Toggle */}
                <Card className="p-4 mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-slate-700 font-qurova">Wallet Type</span>
                    <div className="flex bg-white rounded-xl p-1">
                      {["male", "female"].map((gender) => (
                        <button
                          key={gender}
                          onClick={() => setUserGender(gender as "male" | "female")}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            userGender === gender
                              ? "bg-indigo-500 text-white shadow-sm"
                              : "text-slate-600 hover:text-indigo-600"
                          }`}
                        >
                          {gender === "male" ? "Dowry" : "Purse"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 font-queensides">
                    {userGender === "male"
                      ? "Mint dowry wallets to offer to your future wife"
                      : "Mint purse wallets to receive and manage your funds"}
                  </p>
                </Card>

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
                  <Card className="p-8 text-center">
                    <Wallet className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="font-bold text-slate-700 font-qurova mb-2">No Wallets Yet</h3>
                    <p className="text-slate-600 font-queensides mb-4">
                      Mint your first {userGender === "male" ? "dowry" : "purse"} wallet to get started
                    </p>
                    <Button
                      onClick={() => setActiveTab("mint")}
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-queensides"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Mint Now
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {ownedWallets.map((wallet) => (
                      <Card key={wallet.id} className="p-4 border-indigo-200/50">
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 flex-shrink-0">
                            <img
                              src={wallet.image || "/placeholder.svg"}
                              alt={wallet.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-bold text-slate-800 font-qurova">{wallet.name}</h3>
                              <span className="text-xs text-slate-500 font-queensides">Minted {wallet.mintDate}</span>
                            </div>

                            {/* Wallet Address */}
                            <div className="mb-3">
                              <p className="text-xs text-slate-500 font-queensides mb-1">Wallet Address</p>
                              <div className="flex items-center space-x-2">
                                <code className="text-sm font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded flex-1 truncate">
                                  {shortenAddress(wallet.address)}
                                </code>
                                <button
                                  onClick={() => copyAddress(wallet.address)}
                                  className="p-1 hover:bg-slate-100 rounded transition-colors"
                                >
                                  <Copy className="w-4 h-4 text-slate-500" />
                                </button>
                                <button
                                  onClick={() =>
                                    window.open(
                                      `https://explorer.solana.com/address/${wallet.address}?cluster=devnet`,
                                      "_blank",
                                    )
                                  }
                                  className="p-1 hover:bg-slate-100 rounded transition-colors"
                                >
                                  <ExternalLink className="w-4 h-4 text-slate-500" />
                                </button>
                              </div>
                            </div>

                            {/* Balances */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-indigo-50 rounded-lg p-3">
                                <p className="text-xs text-indigo-600 font-queensides mb-1">SOL Balance</p>
                                <p className="font-bold text-indigo-800 font-qurova">{wallet.solBalance.toFixed(4)}</p>
                              </div>
                              <div className="bg-purple-50 rounded-lg p-3">
                                <p className="text-xs text-purple-600 font-queensides mb-1">SAMAA Balance</p>
                                <p className="font-bold text-purple-800 font-qurova">
                                  {wallet.samaaBalance.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
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
