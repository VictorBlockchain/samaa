"use client"

import { motion } from "framer-motion"
import { ArrowLeft, MessageCircle, Mail, Book, Phone, Clock, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { CelestialBackground } from "@/components/ui/celestial-background"

export default function SupportPage() {
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
              <h1 className="text-xl font-bold text-slate-800 font-qurova">Support Center</h1>
              <p className="text-sm text-slate-600 font-queensides">We're here to help</p>
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
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-200/50"
                >
                  <MessageCircle className="w-10 h-10 text-indigo-600" />
                </motion.div>

                <h2 className="text-3xl font-bold text-slate-800 mb-4 font-qurova">
                  How Can We Help?
                </h2>
                <p className="text-lg text-slate-600 font-queensides leading-relaxed">
                  Our dedicated support team is here to assist you with any questions about 
                  <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Samaa, crypto wallets, or finding your perfect match
                  </span>.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Contact Methods */}
          <div className="grid grid-cols-1 gap-6 mb-8">
            {[
              {
                icon: MessageCircle,
                title: "Live Chat",
                description: "Get instant help from our support team",
                availability: "Available 24/7",
                action: "Start Chat",
                color: "blue"
              },
              {
                icon: Mail,
                title: "Email Support",
                description: "Send us a detailed message about your issue",
                availability: "Response within 24 hours",
                action: "Send Email",
                color: "green"
              },
              {
                icon: Phone,
                title: "Phone Support",
                description: "Speak directly with a support specialist",
                availability: "Mon-Fri, 9 AM - 6 PM EST",
                action: "Call Now",
                color: "purple"
              }
            ].map((method, index) => (
              <motion.div
                key={method.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                className="relative group"
              >
                <div className="relative rounded-2xl p-6 border-2 border-indigo-300/20 hover:border-indigo-400/40 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-gradient-to-br from-white/5 to-indigo-50/10">
                  <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-indigo-400/60 rounded-tl-lg"></div>
                  <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-purple-400/60 rounded-tr-lg"></div>
                  <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-purple-400/60 rounded-bl-lg"></div>
                  <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-indigo-400/60 rounded-br-lg"></div>

                  <div className="relative z-10">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center border border-indigo-200/50 flex-shrink-0">
                        <method.icon className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-800 font-qurova mb-2">{method.title}</h3>
                        <p className="text-slate-600 font-queensides mb-3">{method.description}</p>
                        <div className="flex items-center space-x-2 mb-4">
                          <Clock className="w-4 h-4 text-indigo-500" />
                          <span className="text-sm text-indigo-600 font-queensides">{method.availability}</span>
                        </div>
                        <button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-queensides px-4 py-2 rounded-lg transition-all duration-300">
                          {method.action}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
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
                    <Book className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 font-qurova">Frequently Asked Questions</h3>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      question: "How do I create my first crypto wallet?",
                      answer: "Check our 'Get Started with Crypto' guide for step-by-step instructions."
                    },
                    {
                      question: "What are Smart NFT wallets?",
                      answer: "Visit our 'Dowry & Purse Wallets' page to learn about our innovative wallet system."
                    },
                    {
                      question: "Is Samaa safe and secure?",
                      answer: "Yes, we use industry-leading security practices and Islamic principles guide our platform."
                    },
                    {
                      question: "How much does Samaa cost?",
                      answer: "Samaa uses a token-based system instead of monthly fees. You only pay for what you use."
                    }
                  ].map((faq, index) => (
                    <div key={index} className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 rounded-xl p-4 border border-green-200/30">
                      <h4 className="font-semibold text-green-700 font-queensides mb-2">{faq.question}</h4>
                      <p className="text-slate-600 font-queensides text-sm">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Community Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="relative group mb-8"
          >
            <div className="relative rounded-2xl p-6 border-2 border-purple-300/20 hover:border-purple-400/40 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-gradient-to-br from-purple-50/50 to-pink-50/30">
              <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-purple-400/60 rounded-tl-lg"></div>
              <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-pink-400/60 rounded-tr-lg"></div>
              <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-pink-400/60 rounded-bl-lg"></div>
              <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-purple-400/60 rounded-br-lg"></div>

              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center border border-purple-200/50 mr-4">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 font-qurova">Community Support</h3>
                </div>
                <p className="text-slate-600 font-queensides leading-relaxed mb-4">
                  Join our community forums and social media groups to connect with other Samaa users, 
                  share experiences, and get peer support on your marriage journey.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-purple-50/50 rounded-lg p-3 text-center">
                    <span className="text-xs text-purple-600 font-queensides">💬 Discord Community</span>
                  </div>
                  <div className="bg-pink-50/50 rounded-lg p-3 text-center">
                    <span className="text-xs text-pink-600 font-queensides">📱 Telegram Group</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Emergency Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="text-center"
          >
            <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-xl p-6 border border-amber-200/30">
              <h3 className="text-xl font-bold text-slate-800 mb-3 font-qurova">Emergency Support</h3>
              <p className="text-slate-600 font-queensides leading-relaxed mb-4">
                For urgent security issues or account problems, contact our emergency support line immediately.
              </p>
              <div className="flex justify-center space-x-4 text-sm mb-4">
                <div className="flex items-center space-x-2 text-amber-600">
                  <div className="w-2 h-2 bg-amber-500/70 rounded-full"></div>
                  <span className="font-queensides">24/7 Emergency Line</span>
                </div>
                <div className="flex items-center space-x-2 text-orange-600">
                  <div className="w-2 h-2 bg-orange-500/70 rounded-full"></div>
                  <span className="font-queensides">Immediate Response</span>
                </div>
              </div>
              <p className="text-amber-700 font-queensides font-semibold">
                emergency@samaa.app | +1 (555) 123-HELP
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
