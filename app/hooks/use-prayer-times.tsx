"use client"

import { useState, useEffect } from "react"

interface PrayerTimes {
  fajr: string
  dhuhr: string
  asr: string
  maghrib: string
  isha: string
  sunrise: string
  sunset: string
}

interface PrayerTimeData {
  times: PrayerTimes | null
  currentPrayer: string
  nextPrayer: string
  timeToNext: string
  isLoading: boolean
  error: string | null
}

export function usePrayerTimes(latitude?: number, longitude?: number): PrayerTimeData {
  const [prayerData, setPrayerData] = useState<PrayerTimeData>({
    times: null,
    currentPrayer: "",
    nextPrayer: "",
    timeToNext: "",
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        // If no coordinates provided, try to get user's location
        if (!latitude || !longitude) {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                fetchPrayerTimesForLocation(position.coords.latitude, position.coords.longitude)
              },
              () => {
                // Default to Mecca coordinates if location access denied
                fetchPrayerTimesForLocation(21.4225, 39.8262)
              }
            )
          } else {
            // Default to Mecca coordinates if geolocation not supported
            fetchPrayerTimesForLocation(21.4225, 39.8262)
          }
        } else {
          fetchPrayerTimesForLocation(latitude, longitude)
        }
      } catch (error) {
        setPrayerData(prev => ({
          ...prev,
          isLoading: false,
          error: "Failed to fetch prayer times"
        }))
      }
    }

    const fetchPrayerTimesForLocation = async (lat: number, lng: number) => {
      try {
        const today = new Date()
        const dateString = today.toISOString().split('T')[0]
        
        // Using Aladhan API for prayer times
        const response = await fetch(
          `https://api.aladhan.com/v1/timings/${dateString}?latitude=${lat}&longitude=${lng}&method=2`
        )
        
        if (!response.ok) {
          throw new Error('Failed to fetch prayer times')
        }
        
        const data = await response.json()
        const timings = data.data.timings
        
        const times: PrayerTimes = {
          fajr: timings.Fajr,
          dhuhr: timings.Dhuhr,
          asr: timings.Asr,
          maghrib: timings.Maghrib,
          isha: timings.Isha,
          sunrise: timings.Sunrise,
          sunset: timings.Sunset,
        }
        
        const { currentPrayer, nextPrayer, timeToNext } = getCurrentPrayerInfo(times)
        
        setPrayerData({
          times,
          currentPrayer,
          nextPrayer,
          timeToNext,
          isLoading: false,
          error: null,
        })
      } catch (error) {
        setPrayerData(prev => ({
          ...prev,
          isLoading: false,
          error: "Failed to fetch prayer times"
        }))
      }
    }

    fetchPrayerTimes()
    
    // Update every minute
    const interval = setInterval(() => {
      if (prayerData.times) {
        const { currentPrayer, nextPrayer, timeToNext } = getCurrentPrayerInfo(prayerData.times)
        setPrayerData(prev => ({
          ...prev,
          currentPrayer,
          nextPrayer,
          timeToNext,
        }))
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [latitude, longitude])

  return prayerData
}

function getCurrentPrayerInfo(times: PrayerTimes) {
  const now = new Date()
  const currentTime = now.getHours() * 60 + now.getMinutes()
  
  const prayerList = [
    { name: "Fajr", time: times.fajr },
    { name: "Dhuhr", time: times.dhuhr },
    { name: "Asr", time: times.asr },
    { name: "Maghrib", time: times.maghrib },
    { name: "Isha", time: times.isha },
  ]
  
  // Convert prayer times to minutes
  const prayerMinutes = prayerList.map(prayer => {
    const [hours, minutes] = prayer.time.split(':').map(Number)
    return {
      name: prayer.name,
      minutes: hours * 60 + minutes,
    }
  })
  
  let currentPrayer = "Isha" // Default to last prayer
  let nextPrayer = "Fajr" // Default to first prayer of next day
  let timeToNext = ""
  
  for (let i = 0; i < prayerMinutes.length; i++) {
    const prayer = prayerMinutes[i]
    const nextPrayerIndex = (i + 1) % prayerMinutes.length
    
    if (currentTime >= prayer.minutes) {
      currentPrayer = prayer.name
      nextPrayer = prayerMinutes[nextPrayerIndex].name
      
      // Calculate time to next prayer
      let nextPrayerTime = prayerMinutes[nextPrayerIndex].minutes
      if (nextPrayerTime <= currentTime) {
        nextPrayerTime += 24 * 60 // Next day
      }
      
      const minutesToNext = nextPrayerTime - currentTime
      const hoursToNext = Math.floor(minutesToNext / 60)
      const minsToNext = minutesToNext % 60
      
      if (hoursToNext > 0) {
        timeToNext = `${hoursToNext}h ${minsToNext}m`
      } else {
        timeToNext = `${minsToNext}m`
      }
      
      break
    }
  }
  
  return { currentPrayer, nextPrayer, timeToNext }
}
