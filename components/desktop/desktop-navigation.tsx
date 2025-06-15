"use client"

import { WalletMultiButton } from "@/components/wallet/wallet-multi-button"

export function DesktopNavigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-lg border-b border-indigo-100/30">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-3xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight font-qurova">
              Samaa
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#"
              className="text-gray-700 hover:text-indigo-700 transition-colors duration-200 relative group font-qurova"
            >
              How It Works
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full transition-all duration-300" />
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-indigo-700 transition-colors duration-200 relative group font-qurova"
            >
              Success Stories
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full transition-all duration-300" />
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-indigo-700 transition-colors duration-200 relative group font-qurova"
            >
              Safety & Privacy
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full transition-all duration-300" />
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-indigo-700 transition-colors duration-200 relative group font-qurova"
            >
              Islamic Guidelines
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full transition-all duration-300" />
            </a>
          </div>

          <div className="flex items-center">
            <WalletMultiButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
