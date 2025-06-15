"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Coins, HeartHandshake, Wallet, Mic, ShoppingBag, Sparkles, Heart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function MobileFeatures() {
  const features = [
    {
      icon: Coins,
      title: "No Monthly Subscription Fees",
      description: "Hold Raha tokens to utilize the service",
      color: "from-emerald-500 to-emerald-600",
      borderColor: "border-l-emerald-400",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      icon: HeartHandshake,
      title: "We Want You to Get Married",
      description: "Serious suitors create a dowry wallet and fund it with Raha tokens & Solana",
      color: "from-pink-500 to-pink-600",
      borderColor: "border-l-pink-400",
      bgColor: "bg-pink-50",
      iconColor: "text-pink-600",
    },
    {
      icon: Wallet,
      title: "We Want to Empower Muslima's with Crypto",
      description: "Create a purse to showcase your financial independence",
      color: "from-purple-500 to-purple-600",
      borderColor: "border-l-purple-400",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      icon: Mic,
      title: "Talk Not Comments",
      description: "Threaded audio conversations",
      color: "from-blue-500 to-blue-600",
      borderColor: "border-l-blue-400",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      icon: ShoppingBag,
      title: "Market Place",
      description: "Sell your fashion items or home goods in your marketplace",
      color: "from-amber-500 to-amber-600",
      borderColor: "border-l-amber-400",
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
    },
  ]

  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="py-20 px-4">
      <div className="max-w-sm mx-auto">
        {/* Enhanced section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-pink-500" />
            <span className="text-2xs font-medium text-gray-500 uppercase tracking-wider">Features</span>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4 font-display">
            Why Choose
            <span className="block gradient-text mt-1">Raha?</span>
          </h2>
          <p className="text-gray-600 font-light">We believe in connections not fees</p>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "4rem" }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="h-0.5 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full mx-auto mt-4"
          />
        </motion.div>

        <div ref={ref} className="space-y-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
            >
              <Card
                className={`group modern-card border-l-4 ${feature.borderColor} hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className={`w-14 h-14 ${feature.bgColor} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-soft border border-white`}
                    >
                      <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
                    </motion.div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-3 text-lg leading-tight">{feature.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4">{feature.description}</p>

                      <motion.button
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative overflow-hidden bg-gradient-to-r from-pink-100 via-rose-100 to-pink-100 hover:from-pink-200 hover:via-rose-200 hover:to-pink-200 text-pink-600 hover:text-pink-700 text-sm font-medium px-5 py-2.5 rounded-2xl border border-pink-200/60 hover:border-pink-300 transition-all duration-300 group/learn flex items-center gap-2 shadow-sm hover:shadow-md"
                      >
                        {/* Islamic pattern overlay */}
                        <div className="absolute inset-0 opacity-5">
                          <svg className="w-full h-full" viewBox="0 0 40 40" fill="none">
                            <pattern
                              id={`islamic-pattern-${index}`}
                              x="0"
                              y="0"
                              width="8"
                              height="8"
                              patternUnits="userSpaceOnUse"
                            >
                              <circle cx="4" cy="4" r="0.5" fill="currentColor" />
                              <path d="M2 4 L4 2 L6 4 L4 6 Z" fill="currentColor" opacity="0.3" />
                            </pattern>
                            <rect width="100%" height="100%" fill={`url(#islamic-pattern-${index})`} />
                          </svg>
                        </div>

                        {/* Button content */}
                        <span className="relative z-10 font-medium">Learn more</span>

                        <motion.div
                          className="relative z-10 flex items-center"
                          whileHover={{ x: 2 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 transition-transform duration-200"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </motion.div>

                        {/* Subtle shimmer effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover/learn:opacity-100"
                          animate={{ x: [-60, 120] }}
                          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                        />

                        {/* Bottom glow effect */}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2/3 h-2 bg-pink-300/20 rounded-full blur-sm group-hover/learn:bg-pink-300/40 transition-all duration-300" />
                      </motion.button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Create Your Shop Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-20"
        >
          {/* Modern section divider */}
          <div className="relative mb-12">
            <div className="h-0.5 bg-gradient-to-r from-transparent via-pink-300 to-transparent rounded-full mx-auto" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4">
              <ShoppingBag className="w-6 h-6 text-pink-400" />
            </div>
          </div>

          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse-soft" />
              <span className="text-2xs font-medium text-gray-500 uppercase tracking-wider">Marketplace</span>
            </div>

            <h2 className="text-2xl font-bold gradient-text mb-2 font-display">Create Your Shop</h2>
            <p className="text-gray-500 text-sm font-light">Showcase your products and earn with Raha</p>
          </div>

          {/* Enhanced shop products grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                title: "Premium Hijab",
                seller: "Aisha",
                price: "$25",
                tag: "New",
                tagColor: "bg-emerald-500",
                image:
                  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                delay: 0,
              },
              {
                title: "Islamic Calligraphy",
                seller: "Fatima",
                price: "$45",
                tag: "Art",
                tagColor: "bg-blue-500",
                image:
                  "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                delay: 0.1,
              },
              {
                title: "Prayer Rug",
                seller: "Khadija",
                price: "$35",
                tag: "Home",
                tagColor: "bg-purple-500",
                image:
                  "https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                delay: 0.2,
              },
              {
                title: "Modest Dress",
                seller: "Maryam",
                price: "$55",
                tag: "Fashion",
                tagColor: "bg-pink-500",
                image:
                  "https://images.unsplash.com/photo-1506629905607-c7a8b1e8e3c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                delay: 0.3,
              },
              {
                title: "Gold Earrings",
                seller: "Zahra",
                price: "$85",
                tag: "Jewelry",
                tagColor: "bg-amber-500",
                image:
                  "https://images.unsplash.com/photo-1544441893-675973e31985?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                delay: 0.4,
              },
              {
                title: "Islamic Books",
                seller: "Amina",
                price: "$20",
                tag: "Books",
                tagColor: "bg-teal-500",
                image:
                  "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                delay: 0.5,
              },
            ].map((product, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{ delay: 1 + product.delay, duration: 0.4 }}
                className="modern-card rounded-2xl overflow-hidden group hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                  <div className="absolute top-2 right-2">
                    <div
                      className={`${product.tagColor} text-white text-2xs font-medium px-2 py-1 rounded-full shadow-soft`}
                    >
                      {product.tag}
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-gray-800 text-sm mb-1 leading-tight">{product.title}</h3>
                  <p className="text-xs text-gray-500">
                    By {product.seller} • {product.price}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Enhanced bottom section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 1.8, duration: 0.5 }}
            className="mt-10 text-center"
          >
            <div className="h-0.5 bg-gradient-to-r from-transparent via-pink-300 to-transparent rounded-full mx-auto mb-6" />

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="relative overflow-hidden bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 text-white font-semibold px-8 py-4 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 group border-2 border-white/20"
            >
              {/* Background shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: [-100, 300] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              />

              {/* Islamic pattern overlay */}
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                  <pattern id="islamic-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="10" cy="10" r="1" fill="currentColor" />
                    <path d="M5 10 L10 5 L15 10 L10 15 Z" fill="currentColor" opacity="0.3" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#islamic-dots)" />
                </svg>
              </div>

              {/* Button content */}
              <div className="relative z-10 flex items-center justify-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"
                >
                  <ShoppingBag className="w-4 h-4" />
                </motion.div>

                <span className="font-display tracking-wide">Start your shop</span>

                <motion.div
                  className="flex items-center"
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.div>
              </div>

              {/* Floating hearts effect */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      left: `${20 + i * 30}%`,
                      top: `${30 + i * 20}%`,
                    }}
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0, 0.6, 0],
                      scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: i * 0.5,
                      ease: "easeInOut",
                    }}
                  >
                    <Heart className="w-3 h-3 text-white/40" />
                  </motion.div>
                ))}
              </div>

              {/* Bottom glow effect */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-pink-400/30 rounded-full blur-lg group-hover:bg-pink-400/50 transition-all duration-300" />
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
