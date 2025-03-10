import axios from "axios"
import moment from "moment"

interface PrayerTimings {
  Fajr: string
  Sunrise: string
  Dhuhr: string
  Asr: string
  Sunset: string
  Maghrib: string
  Isha: string
  Imsak: string
  Midnight: string
}

interface PrayerTimesResponse {
  timings: PrayerTimings
  date: {
    readable: string
    timestamp: string
    gregorian: {
      date: string
      format: string
      day: string
      weekday: {
        en: string
      }
      month: {
        number: number
        en: string
      }
      year: string
    }
    hijri: {
      date: string
      format: string
      day: string
      weekday: {
        en: string
        ar: string
      }
      month: {
        number: number
        en: string
        ar: string
      }
      year: string
      holidays: string[]
    }
  }
}

export async function getPrayerTimes(date: string = moment().format("DD-MM-YYYY")): Promise<PrayerTimesResponse> {
  try {
    const response = await axios.get(`https://api.aladhan.com/v1/timingsByCity/${date}`, {
      params: {
        city: "FortSmith",
        country: "US",
        state: "Arkansas",
        school: 0,
        adjustment: 1,
        method: 2,
        shafaq: "ahmer",
        latitudeAdjustmentMethod: 3,
        calendarMethod: "UAQ",
      },
      headers: {
        accept: "application/json",
      },
    })

    return response.data.data
  } catch (error) {
    console.error("Error fetching prayer times:", error)
    throw error
  }
}

export function getNextPrayer(timings: PrayerTimings): { name: string; time: string; timeRemaining: string } {
  const prayers = [
    { name: "Fajr", time: timings.Fajr },
    { name: "Dhuhr", time: timings.Dhuhr },
    { name: "Asr", time: timings.Asr },
    { name: "Maghrib", time: timings.Maghrib },
    { name: "Isha", time: timings.Isha },
  ]

  const now = moment()

  // Convert prayer times to moment objects for today
  const prayerMoments = prayers.map((prayer) => {
    const [hours, minutes] = prayer.time.split(":").map(Number)
    return {
      name: prayer.name,
      moment: moment().hours(hours).minutes(minutes).seconds(0),
    }
  })

  // Find the next prayer
  let nextPrayer = prayerMoments.find((prayer) => prayer.moment.isAfter(now))

  // If no prayer is found, the next prayer is Fajr tomorrow
  if (!nextPrayer) {
    const [hours, minutes] = prayers[0].time.split(":").map(Number)
    nextPrayer = {
      name: "Fajr (Tomorrow)",
      moment: moment().add(1, "day").hours(hours).minutes(minutes).seconds(0),
    }
  }

  // Calculate time remaining
  const duration = moment.duration(nextPrayer.moment.diff(now))
  const hours = Math.floor(duration.asHours())
  const minutes = Math.floor(duration.asMinutes()) % 60

  return {
    name: nextPrayer.name,
    time: nextPrayer.moment.format("h:mm A"),
    timeRemaining: `${hours}h ${minutes}m`,
  }
}

export function formatPrayerTimes(timings: PrayerTimings): { [key: string]: string } {
  const formattedTimes: { [key: string]: string } = {}

  Object.entries(timings).forEach(([prayer, time]) => {
    const [hours, minutes] = time.split(":").map(Number)
    formattedTimes[prayer] = moment().hours(hours).minutes(minutes).format("h:mm A")
  })

  return formattedTimes
}

export function isRamadan(hijriDate: { month: { number: number } }): boolean {
  return hijriDate.month.number === 9 // Ramadan is the 9th month
}

export function getRamadanDay(hijriDate: { day: string; month: { number: number } }): number {
  if (hijriDate.month.number === 9) {
    return Number.parseInt(hijriDate.day)
  }
  return 0
}

