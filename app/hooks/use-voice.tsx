"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface VoiceState {
  isListening: boolean
  isSupported: boolean
  transcript: string
  confidence: number
  error: string | null
}

interface VoiceCommands {
  [key: string]: (transcript: string) => void
}

export function useVoice(commands: VoiceCommands = {}) {
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isSupported: false,
    transcript: "",
    confidence: 0,
    error: null,
  })

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (SpeechRecognition) {
      setVoiceState(prev => ({ ...prev, isSupported: true }))
      
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = 'en-US' // Can be made configurable for Arabic support
      
      recognition.onstart = () => {
        setVoiceState(prev => ({ ...prev, isListening: true, error: null }))
      }
      
      recognition.onresult = (event) => {
        const result = event.results[event.results.length - 1]
        const transcript = result[0].transcript.toLowerCase().trim()
        const confidence = result[0].confidence
        
        setVoiceState(prev => ({
          ...prev,
          transcript,
          confidence,
        }))
        
        // Check for voice commands
        if (result.isFinal) {
          processVoiceCommand(transcript)
        }
      }
      
      recognition.onerror = (event) => {
        setVoiceState(prev => ({
          ...prev,
          isListening: false,
          error: `Speech recognition error: ${event.error}`,
        }))
      }
      
      recognition.onend = () => {
        setVoiceState(prev => ({ ...prev, isListening: false }))
      }
      
      recognitionRef.current = recognition
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const processVoiceCommand = useCallback((transcript: string) => {
    // Islamic greetings and responses
    if (transcript.includes('assalam') || transcript.includes('salam')) {
      speak("Wa alaykum assalam wa rahmatullahi wa barakatuh")
      return
    }
    
    // Navigation commands
    if (transcript.includes('go to') || transcript.includes('open')) {
      if (transcript.includes('profile')) {
        commands.navigateToProfile?.(transcript)
      } else if (transcript.includes('matches') || transcript.includes('suitors')) {
        commands.navigateToMatches?.(transcript)
      } else if (transcript.includes('messages')) {
        commands.navigateToMessages?.(transcript)
      } else if (transcript.includes('home')) {
        commands.navigateToHome?.(transcript)
      }
      return
    }
    
    // Prayer-related commands
    if (transcript.includes('prayer') || transcript.includes('salah')) {
      if (transcript.includes('time')) {
        commands.showPrayerTimes?.(transcript)
      } else if (transcript.includes('qibla')) {
        commands.showQibla?.(transcript)
      }
      return
    }
    
    // Search commands
    if (transcript.includes('search') || transcript.includes('find')) {
      commands.search?.(transcript)
      return
    }
    
    // Check for custom commands
    for (const [command, handler] of Object.entries(commands)) {
      if (transcript.includes(command.toLowerCase())) {
        handler(transcript)
        return
      }
    }
    
    // Default response for unrecognized commands
    speak("I didn't understand that command. Try saying 'help' for available commands.")
  }, [commands])

  const startListening = useCallback(() => {
    if (recognitionRef.current && voiceState.isSupported) {
      try {
        recognitionRef.current.start()
        
        // Auto-stop after 10 seconds
        timeoutRef.current = setTimeout(() => {
          stopListening()
        }, 10000)
      } catch (error) {
        setVoiceState(prev => ({
          ...prev,
          error: "Failed to start voice recognition",
        }))
      }
    }
  }, [voiceState.isSupported])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const speak = useCallback((text: string, lang: string = 'en-US') => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8
      
      // Use a more pleasant voice if available
      const voices = speechSynthesis.getVoices()
      const preferredVoice = voices.find(voice => 
        voice.lang.includes('en') && voice.name.includes('Female')
      ) || voices.find(voice => voice.lang.includes('en'))
      
      if (preferredVoice) {
        utterance.voice = preferredVoice
      }
      
      speechSynthesis.speak(utterance)
    }
  }, [])

  const speakArabic = useCallback((text: string) => {
    speak(text, 'ar-SA') // Arabic (Saudi Arabia)
  }, [speak])

  return {
    ...voiceState,
    startListening,
    stopListening,
    speak,
    speakArabic,
  }
}

// Voice command presets for Islamic app
export const islamicVoiceCommands = {
  navigateToProfile: (transcript: string) => {
    console.log("Navigating to profile...")
    // Implementation would go here
  },
  navigateToMatches: (transcript: string) => {
    console.log("Navigating to matches...")
    // Implementation would go here
  },
  navigateToMessages: (transcript: string) => {
    console.log("Navigating to messages...")
    // Implementation would go here
  },
  navigateToHome: (transcript: string) => {
    console.log("Navigating to home...")
    // Implementation would go here
  },
  showPrayerTimes: (transcript: string) => {
    console.log("Showing prayer times...")
    // Implementation would go here
  },
  showQibla: (transcript: string) => {
    console.log("Showing Qibla direction...")
    // Implementation would go here
  },
  search: (transcript: string) => {
    const searchTerm = transcript.replace(/search|find/gi, '').trim()
    console.log(`Searching for: ${searchTerm}`)
    // Implementation would go here
  },
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}
