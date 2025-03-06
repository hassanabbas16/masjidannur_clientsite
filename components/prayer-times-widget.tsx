"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"
import axios from "axios"

type PrayerTime = {
  name: string
  time: string
  icon?: React.ReactNode
  isActualPrayer: boolean
  isCurrent?: boolean 
}

export default function PrayerTimesWidget() {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([])
  const [currentDate, setCurrentDate] = useState("")
  const [currentTime, setCurrentTime] = useState("")
  const [nextPrayer, setNextPrayer] = useState<{ name: string | null; time: string | null }>({
    name: null,
    time: null,
  })

  useEffect(() => {
    // Format current date in Fort Smith local time
    const date = new Date()
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "America/Chicago"
    }
    setCurrentDate(date.toLocaleDateString("en-US", options))

    // Update current time every minute in Fort Smith local time
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone: "America/Chicago"
        })
      )
    }

    updateTime()
    const interval = setInterval(updateTime, 60000)

    // Fetch prayer times and determine current/next prayer
    const fetchPrayerTimes = async () => {
      try {
        const timingsResponse = await axios.get(
          `https://api.aladhan.com/v1/timingsByCity`, {
            params: {
              city: "FortSmith",
              country: "US",
              state: "Arkansas",
              method: 2,
              shafaq: "ahmer",
              school: 0,
              adjustment: 1,
              latitudeAdjustmentMethod: 3,
              date: "today",
            }
          }
        )
        const prayerData = timingsResponse.data.data.timings

        // Define prayer times with isActualPrayer flag
        const formattedPrayerTimes: PrayerTime[] = [
          { name: "Fajr", time: prayerData.Fajr, icon: <Clock className="h-4 w-4" />, isActualPrayer: true },
          { name: "Sunrise", time: prayerData.Sunrise, icon: <Clock className="h-4 w-4" />, isActualPrayer: false },
          { name: "Dhuhr", time: prayerData.Dhuhr, icon: <Clock className="h-4 w-4" />, isActualPrayer: true },
          { name: "Asr", time: prayerData.Asr, icon: <Clock className="h-4 w-4" />, isActualPrayer: true },
          { name: "Maghrib", time: prayerData.Maghrib, icon: <Clock className="h-4 w-4" />, isActualPrayer: true },
          { name: "Isha", time: prayerData.Isha, icon: <Clock className="h-4 w-4" />, isActualPrayer: true },
        ]

        // Convert prayer times to AM/PM format for display only
        formattedPrayerTimes.forEach(prayer => {
          const [hours, minutes] = prayer.time.split(":")
          const prayerDate = new Date()
          prayerDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
          prayer.time = prayerDate.toLocaleTimeString("en-US", { 
            hour12: true, 
            hour: "2-digit", 
            minute: "2-digit"
          })
        })

        // Get current time in Fort Smith for comparison
        const now = new Date()
        const currentTimeCST = new Date(now.toLocaleString("en-US", { timeZone: "America/Chicago" }))

        // Create prayerDates map for comparison using original API times
        const prayerDates: { [key: string]: Date } = {}
        formattedPrayerTimes.forEach(prayer => {
          const [hours, minutes] = prayerData[prayer.name].split(":")
          const prayerDate = new Date(currentTimeCST)
          prayerDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
          prayerDates[prayer.name] = prayerDate
        })

        // Find current prayer based on time windows
        let currentPrayer = null
        for (const prayer of formattedPrayerTimes) {
          if (prayer.isActualPrayer) {
            let endTime: Date
            if (prayer.name === 'Fajr') {
              endTime = prayerDates['Sunrise']
            } else if (prayer.name === 'Isha') {
              endTime = new Date(currentTimeCST)
              endTime.setHours(23, 59, 59, 999) // End of day approximation
            } else {
              const nextPrayerIndex = formattedPrayerTimes.findIndex(p => p.name === prayer.name) + 1
              const nextPrayer = formattedPrayerTimes[nextPrayerIndex]
              endTime = prayerDates[nextPrayer.name]
            }
            if (currentTimeCST >= prayerDates[prayer.name] && currentTimeCST < endTime) {
              currentPrayer = prayer.name
              break
            }
          }
        }

        // Set isCurrent for the current prayer
        if (currentPrayer) {
          const currentPrayerObj = formattedPrayerTimes.find(p => p.name === currentPrayer)
          if (currentPrayerObj) {
            currentPrayerObj.isCurrent = true
          }
        }

        // Find next event (prayer or Sunrise)
        let nextPrayerName = null
        let nextPrayerTime = null
        for (const prayer of formattedPrayerTimes) {
          if (prayerDates[prayer.name] > currentTimeCST) {
            nextPrayerName = prayer.name === "Sunrise" ? "Next: Sunrise" : `Next Prayer: ${prayer.name}`
            nextPrayerTime = prayer.time
            break
          }
        }
        setNextPrayer({ name: nextPrayerName, time: nextPrayerTime })

        setPrayerTimes(formattedPrayerTimes)

      } catch (error) {
        console.error("Error fetching prayer times:", error)
      }
    }

    fetchPrayerTimes()

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="shadow-elegant border-0 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary to-primary/90 text-white py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <CardTitle className="text-2xl font-heading">{currentDate}</CardTitle>
            <p className="text-white/80 mt-1">Current time: {currentTime}</p>
          </div>
          {nextPrayer.name && (
            <div className="bg-white/10 px-4 py-2 rounded-full text-sm">
              {nextPrayer.name}: <span className="font-bold">{nextPrayer.time}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
          {prayerTimes.map((prayer) => (
            <div
              key={prayer.name}
              className={`p-6 text-center ${prayer.isCurrent ? "border-t-4 border-primary" : ""}`}
            >
              <div className={`flex flex-col items-center ${prayer.isCurrent ? "text-primary" : ""}`}>
                <h3 className="font-medium text-lg mb-1">{prayer.name}</h3>
                <div className="flex items-center gap-1 text-lg font-medium">{prayer.time}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}