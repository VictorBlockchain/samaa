"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Heart, Users, Shield, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { CelestialBackground } from "@/components/ui/celestial-background"

export default function AboutPage() {
  const router = useRouter()

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
              <h1 className="text-xl font-bold text-slate-800 font-qurova">About Samaa</h1>
              <p className="text-sm text-slate-600 font-queensides">Where hearts meet heaven</p>
            </div>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pb-32">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative group mb-8"
          >
            <div className="relative rounded-2xl p-8 border-2 border-indigo-300/20 hover:border-indigo-400/40 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-gradient-to-br from-white/5 to-indigo-50/10">
              {/* Arabic-inspired corner decorations */}
              <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-indigo-400/60 rounded-tl-xl"></div>
              <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-purple-400/60 rounded-tr-xl"></div>
              <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-purple-400/60 rounded-bl-xl"></div>
              <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-indigo-400/60 rounded-br-xl"></div>

              <div className="relative z-10 text-center">
                {/* Logo */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-200/50"
                >
                  <Heart className="w-10 h-10 text-indigo-600" />
                </motion.div>

                <h2 className="text-3xl font-bold text-slate-800 mb-4 font-qurova">
                  سماء - Samaa
                </h2>
                <p className="text-xl text-slate-600 font-queensides leading-relaxed mb-6">
                  A revolutionary Islamic marriage platform that combines
                  <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    traditional values with modern technology
                  </span>,
                  creating meaningful connections for Muslim singles worldwide.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Mission Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative group mb-8"
          >
            <div className="relative rounded-2xl p-6 border-2 border-green-300/20 hover:border-green-400/40 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-gradient-to-br from-green-50/50 to-emerald-50/30">
              <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-green-400/60 rounded-tl-lg"></div>
              <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-emerald-400/60 rounded-tr-lg"></div>
              <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-emerald-400/60 rounded-bl-lg"></div>
              <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-green-400/60 rounded-br-lg"></div>

              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center border border-green-200/50 mr-4">
                    <Sparkles className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 font-qurova">Our Mission</h3>
                </div>
                <p className="text-lg text-slate-600 font-queensides leading-relaxed">
                  To create a safe, respectful, and innovative platform where Muslim singles can find their life partners
                  while maintaining Islamic values and principles. We believe that technology should serve faith,
                  not replace it.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 gap-6 mb-8">
            {[
              {
                icon: Shield,
                title: "Islamic Values First",
                description: "Built with Islamic principles at the core, ensuring halal interactions and respectful connections.",
                color: "blue"
              },
              {
                icon: Users,
                title: "Community Focused",
                description: "Connecting the global Muslim community through shared values and meaningful relationships.",
                color: "purple"
              },
              {
                icon: Heart,
                title: "Marriage Minded",
                description: "Designed specifically for Muslims seeking serious relationships leading to marriage.",
                color: "pink"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                className="relative group"
              >
                <div className={`relative rounded-2xl p-6 border-2 border-${feature.color}-300/20 hover:border-${feature.color}-400/40 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-gradient-to-br from-${feature.color}-50/50 to-${feature.color}-100/30`}>
                  <div className={`absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-${feature.color}-400/60 rounded-tl-lg`}></div>
                  <div className={`absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-${feature.color}-400/60 rounded-tr-lg`}></div>
                  <div className={`absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-${feature.color}-400/60 rounded-bl-lg`}></div>
                  <div className={`absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-${feature.color}-400/60 rounded-br-lg`}></div>

                  <div className="relative z-10">
                    <div className="flex items-center mb-3">
                      <div className={`w-10 h-10 bg-gradient-to-br from-${feature.color}-100 to-${feature.color}-200 rounded-full flex items-center justify-center border border-${feature.color}-200/50 mr-3`}>
                        <feature.icon className={`w-5 h-5 text-${feature.color}-600`} />
                      </div>
                      <h4 className="text-lg font-bold text-slate-800 font-qurova">{feature.title}</h4>
                    </div>
                    <p className="text-slate-600 font-queensides leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Vision Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="relative group mb-8"
          >
            <div className="relative rounded-2xl p-6 border-2 border-amber-300/20 hover:border-amber-400/40 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-gradient-to-br from-amber-50/50 to-orange-50/30">
              <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-amber-400/60 rounded-tl-lg"></div>
              <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-orange-400/60 rounded-tr-lg"></div>
              <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-orange-400/60 rounded-bl-lg"></div>
              <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-amber-400/60 rounded-br-lg"></div>

              <div className="relative z-10 text-center">
                <h3 className="text-2xl font-bold text-slate-800 mb-4 font-qurova">Our Vision</h3>
                <p className="text-lg text-slate-600 font-queensides leading-relaxed mb-4">
                  To become the world's leading Islamic marriage platform, fostering thousands of blessed unions
                  and strengthening the global Muslim community through technology that honors our faith.
                </p>
                <div className="flex justify-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2 text-amber-600">
                    <div className="w-2 h-2 bg-amber-500/70 rounded-full"></div>
                    <span className="font-queensides">Faith-Centered</span>
                  </div>
                  <div className="flex items-center space-x-2 text-orange-600">
                    <div className="w-2 h-2 bg-orange-500/70 rounded-full"></div>
                    <span className="font-queensides">Innovation</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center"
          >
            <p className="text-slate-500 font-queensides mb-2">
              Questions or feedback? We'd love to hear from you.
            </p>
            <p className="text-indigo-600 font-queensides font-semibold">
              contact@samaa.app
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
