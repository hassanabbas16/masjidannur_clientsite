"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import moment from "moment-hijri"
import { getPrayerTimes, formatPrayerTimes } from "@/lib/prayer-times"

interface IftarSehriTimes {
  date: string // Hijri day
  hijriFullDate: string // Full Hijri date (e.g., "01 رمضان 1444")
  gregorianDate: string // Gregorian date
  day: string // Day name (English)
  sehri: string // Imsak time
  iftar: string // Maghrib time
}

interface IftarSehriTimesData {
  [monthYear: string]: IftarSehriTimes[]
}

// Function to convert numbers to ordinal format (1 -> 1st, 2 -> 2nd, etc.)
const toOrdinal = (num: number): string => {
  const suffixes = ["th", "st", "nd", "rd"]
  const v = num % 100
  return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0])
}

export default function IftarTimesPage() {
  // Determine current Hijri month/year.
  const currentHijriMonth = moment().format("iMMMM")
  const currentHijriYear = moment().format("iYYYY")
  const isCurrentRamadan = currentHijriMonth === "رمضان"

  // Set default selection: if it's Ramadan, default to "Ramadan" (English label).
  const [selectedMonth, setSelectedMonth] = useState<string>(isCurrentRamadan ? "Ramadan" : "")
  const [iftarTimesData, setIftarTimesData] = useState<IftarSehriTimesData>({})
  // The key of the fetched Gregorian month-year used for rendering the table
  const [fetchedKey, setFetchedKey] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [expectedRamadanDate, setExpectedRamadanDate] = useState<string>("")

  // Ref to store table row references for scrolling into view.
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([])

  // Only Ramadan is available in the dropdown.
  const months = ["Ramadan"]

  // Fetch Iftar/Sehri times if current month is Ramadan; otherwise compute next Ramadan date.
  useEffect(() => {
    if (isCurrentRamadan) {
      fetchIftarTimes()
    } else {
      // Calculate expected Ramadan start date for next year.
      const nextRamadan = moment()
        .iYear(Number.parseInt(currentHijriYear) + 1)
        .month(8)
        .date(1) // Month index 8 represents Ramadan (9th month)
      setExpectedRamadanDate(nextRamadan.format("iDD iMMMM iYYYY"))
      setIftarTimesData({})
    }
  }, [isCurrentRamadan, currentHijriYear])

  const fetchIftarTimes = async () => {
    setLoading(true)
    try {
      // Get the first day of Ramadan
      const ramadanStart = moment().iMonth(8).iDate(1)
      const daysInRamadan = 30 // Ramadan has 29 or 30 days

      const formattedData: IftarSehriTimesData = {}
      const monthYear = ramadanStart.format("MMMM YYYY")
      formattedData[monthYear] = []

      // Fetch prayer times for each day of Ramadan
      for (let i = 0; i < daysInRamadan; i++) {
        const currentDate = moment(ramadanStart).add(i, "days")
        const dateString = currentDate.format("DD-MM-YYYY")

        try {
          const prayerTimesData = await getPrayerTimes(dateString)
          const formattedTimes = formatPrayerTimes(prayerTimesData.timings)

          const hijriDay = Number.parseInt(prayerTimesData.date.hijri.day)

          formattedData[monthYear].push({
            date: prayerTimesData.date.hijri.day,
            hijriFullDate: `${toOrdinal(hijriDay)} رمضان ${prayerTimesData.date.hijri.year}`,
            gregorianDate: prayerTimesData.date.gregorian.date,
            day: prayerTimesData.date.gregorian.weekday.en,
            sehri: formattedTimes.Fajr,
            iftar: formattedTimes.Maghrib,
          })
        } catch (error) {
          console.error(`Error fetching prayer times for ${dateString}:`, error)
        }
      }

      setFetchedKey(monthYear)
      setIftarTimesData(formattedData)
    } catch (error) {
      console.error("Error fetching Iftar times:", error)
    } finally {
      setLoading(false)
    }
  }

  // After data is loaded, scroll today's row into view.
  useEffect(() => {
    if (fetchedKey && iftarTimesData[fetchedKey]?.length) {
      const today = moment().date()
      const rowIndex = iftarTimesData[fetchedKey].findIndex((day) => Number.parseInt(day.date) === today)
      if (rowIndex >= 0 && rowRefs.current[rowIndex]) {
        rowRefs.current[rowIndex]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        })
      }
    }
  }, [iftarTimesData, fetchedKey])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-600 to-green-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-5"></div>
        <div className="container relative py-20 md:py-28 flex flex-col items-center text-center">
          <h1 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl xl:text-6xl max-w-4xl mb-6">
            Ramadan Sehri and Iftar Times
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl">
            Complete schedule for the blessed month of Ramadan
          </p>
        </div>
      </section>

      <div className="container px-4 md:px-6 py-12">
        <div className="max-w-md mx-auto mb-8">
          <Select value={selectedMonth} onValueChange={setSelectedMonth} disabled={!isCurrentRamadan}>
            <SelectTrigger>
              <SelectValue placeholder="Select Ramadan month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isCurrentRamadan ? (
          <Card className="border-0 shadow-elegant overflow-hidden">
            <CardHeader className="bg-primary text-primary-foreground">
              <CardTitle className="text-center">Ramadan Schedule</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="px-4 py-3 text-left">Gregorian Date</th>
                        <th className="px-4 py-3 text-left">Hijri Date</th>
                        <th className="px-4 py-3 text-left">Day</th>
                        <th className="px-4 py-3 text-center">Fajr</th>
                        <th className="px-4 py-3 text-center">Iftar (Maghrib)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {iftarTimesData[fetchedKey]?.map((day, index) => {
                        // Compute once the "today" value.
                        const isToday = day.gregorianDate === moment().format("DD-MM-YYYY")
                        return (
                          <tr
                            key={day.gregorianDate}
                            ref={(el) => {
                              rowRefs.current[index] = el
                            }}
                            className={`${index % 2 === 0 ? "bg-white" : "bg-muted/30"} ${isToday ? "bg-primary/10 font-bold" : ""}`}
                          >
                            <td className="px-4 py-3 border-t">{day.gregorianDate}</td>
                            <td className="px-4 py-3 border-t">{day.hijriFullDate}</td>
                            <td className="px-4 py-3 border-t">{day.day}</td>
                            <td className="px-4 py-3 border-t text-center whitespace-nowrap">{day.sehri}</td>
                            <td className="px-4 py-3 border-t text-center whitespace-nowrap">{day.iftar}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-elegant overflow-hidden">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Ramadan Schedule Not Available Yet</h2>
              <p className="text-lg text-muted-foreground mb-4">
                Ramadan is expected to start on <strong>{expectedRamadanDate}</strong>.
              </p>
              <p>Please check back closer to Ramadan for the complete Sehri and Iftar schedule.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

