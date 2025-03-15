import { NextResponse } from "next/server"
import { getPrayerTimes, formatPrayerTimes, getNextPrayer, isRamadan, getRamadanDay } from "@/lib/prayer-times"
import moment from "moment"

// Add this line to make the route dynamic
export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const date = url.searchParams.get("date") || moment().format("DD-MM-YYYY")

    const prayerTimesData = await getPrayerTimes(date)
    const formattedTimes = formatPrayerTimes(prayerTimesData.timings)
    const nextPrayer = getNextPrayer(prayerTimesData.timings)

    return NextResponse.json({
      prayerTimes: formattedTimes,
      nextPrayer,
      date: prayerTimesData.date,
      isRamadan: isRamadan(prayerTimesData.date.hijri),
      ramadanDay: getRamadanDay(prayerTimesData.date.hijri),
    })
  } catch (error) {
    console.error("Error fetching prayer times:", error)
    return NextResponse.json({ error: "Failed to fetch prayer times" }, { status: 500 })
  }
}

