"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import axios from "axios"
import moment from "moment-hijri"

interface IftarSehriTimes {
  date: string               // Hijri day
  hijriFullDate: string      // Full Hijri date (e.g., "01 رمضان 1444")
  gregorianDate: string      // Gregorian date
  day: string                // Day name (English)
  sehri: string              // Imsak time
  iftar: string              // Maghrib time
}

interface IftarSehriTimesData {
  [monthYear: string]: IftarSehriTimes[]
}

export default function IftarTimesPage() {
  // Determine current Hijri month/year.
  const currentHijriMonth = moment().format("iMMMM")
  const currentHijriYear = moment().format("iYYYY")
  const isCurrentRamadan = currentHijriMonth === "رمضان"

  // Set default selection: if it’s Ramadan, default to “Ramadan” (English label).
  const [selectedMonth, setSelectedMonth] = useState<string>(isCurrentRamadan ? "Ramadan" : "")
  const [iftarTimesData, setIftarTimesData] = useState<IftarSehriTimesData>({})
  // The key of the fetched Gregorian month-year used for rendering the table
  const [fetchedKey, setFetchedKey] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [expectedRamadanDate, setExpectedRamadanDate] = useState<string>('')

  // Ref to store table row references for scrolling into view.
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([])

  // Only Ramadan is available in the dropdown.
  const months = ["Ramadan"]

  // Fetch Iftar/Sehri times if current month is Ramadan; otherwise compute next Ramadan date.
  useEffect(() => {
    if (isCurrentRamadan) {
      const fetchIftarTimes = async () => {
        setLoading(true)
        try {
          const response = await axios.get(
            `https://api.aladhan.com/v1/hijriCalendarByCity/${currentHijriYear}/9`, // Ramadan is the 9th month
            {
              params: {
                city: "FortSmith",
                country: "US",
                state: "Arkansas",
                school: 0,
                adjustment: 1,
                method: 2,
                shafaq: "ahmer",
                latitudeAdjustmentMethod: 3,
                calendarMethod: "UAQ"
              },
              headers: {
                accept: "application/json"
              }
            }
          )

          const formattedData = formatIftarTimes(response.data.data)
          const keys = Object.keys(formattedData)
          if (keys.length > 0) {
            // Assume API returns one month’s data – use the first key.
            setFetchedKey(keys[0])
          }
          setIftarTimesData(formattedData)
        } catch (error) {
          console.error("Error fetching Iftar times:", error)
        } finally {
          setLoading(false)
        }
      }
      fetchIftarTimes()
    } else {
      // Calculate expected Ramadan start date for next year.
      const nextRamadan = moment().iYear(parseInt(currentHijriYear) + 1).month(8).date(1) // Month index 8 represents Ramadan (9th month)
      setExpectedRamadanDate(nextRamadan.format("iDD iMMMM iYYYY"))
      setIftarTimesData({})
    }
  }, [isCurrentRamadan, currentHijriYear])

// Function to convert numbers to ordinal format (1 -> 1st, 2 -> 2nd, etc.)
const toOrdinal = (num: number): string => {
  const suffixes = ["th", "st", "nd", "rd"]
  const v = num % 100
  return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0])
}

const formatIftarTimes = (data: any[]): IftarSehriTimesData => {
  const formatted: IftarSehriTimesData = {}
  data.forEach((item) => {
    // Group by Gregorian month and year.
    const monthYear = `${item.date.gregorian.month.en} ${item.date.gregorian.year}`
    if (!formatted[monthYear]) {
      formatted[monthYear] = []
    }
    const hijriDay = parseInt(item.date.hijri.day) // Convert Hijri day to a number
    formatted[monthYear].push({
      date: item.date.hijri.day,
      hijriFullDate: `${toOrdinal(hijriDay)} رمضان ${item.date.hijri.year}`, // Convert to "1st Ramadan", "2nd Ramadan"
      gregorianDate: item.date.gregorian.date,
      day: item.date.gregorian.weekday.en,
      sehri: moment(item.timings.Imsak, "HH:mm").format("h:mm A"),
      iftar: moment(item.timings.Maghrib, "HH:mm").format("h:mm A"),
    })
  })
  return formatted
}


  // After data is loaded, scroll today's row into view.
  useEffect(() => {
    if (fetchedKey && iftarTimesData[fetchedKey]?.length) {
      const today = moment().date()
      const rowIndex = iftarTimesData[fetchedKey].findIndex((day) => parseInt(day.date) === today)
      if (rowIndex >= 0 && rowRefs.current[rowIndex]) {
        rowRefs.current[rowIndex]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        })
      }
    }
  }, [iftarTimesData, fetchedKey])

  return (
    <div className="container px-4 md:px-6 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Ramadan Sehri and Iftar Times</h1>

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
        <Card className="overflow-hidden">
          <CardHeader className="bg-[#0D7A3B] text-white">
            <CardTitle className="text-center">Ramadan Schedule</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <p className="p-4 text-center">Loading...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted">
                      <th className="px-4 py-3 text-left">Gregorian Date</th>
                      <th className="px-4 py-3 text-left">Hijri Date</th>
                      <th className="px-4 py-3 text-left">Day</th>
                      <th className="px-4 py-3 text-center">Sehri (Imsak)</th>
                      <th className="px-4 py-3 text-center">Iftar (Maghrib)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {iftarTimesData[fetchedKey]?.map((day, index) => {
                      // Compute once the "today" value.
                      const isToday = parseInt(day.date) === moment().date()
                      return (
                        <tr
                          key={day.gregorianDate}
                          ref={(el) => { rowRefs.current[index] = el; }}  // Do not return the element, just assign it
                          className={index % 2 === 0 ? "bg-white" : "bg-muted/30"}
                          style={isToday ? { backgroundColor: "#0D8A3B" } : {}}
                        >
                          <td className="px-4 py-3 border-t">{day.gregorianDate}</td>
                          <td className="px-4 py-3 border-t">{day.hijriFullDate}</td>
                          <td className="px-4 py-3 border-t">{day.day}</td>
                          <td className="px-4 py-3 border-t text-center">{day.sehri}</td>
                          <td className="px-4 py-3 border-t text-center">{day.iftar}</td>
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
        <div className="text-center text-lg text-gray-500">
          Ramadan is expected to start on <strong>{expectedRamadanDate}</strong> next year.
        </div>
      )}
    </div>
  )
}
