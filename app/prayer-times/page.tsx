"use client"

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";
import moment from "moment-hijri";

// Define types for prayer times data
interface PrayerTimes {
  date: string;
  day: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

interface PrayerTimesData {
  [month: string]: PrayerTimes[];
}

// Helper function to format time from "HH:mm (TimeZone)" to "h:mm A"
const formatTime = (timeString: string): string => {
  const timePart = timeString.split(" ")[0]; // Extract "HH:mm" from "HH:mm (TimeZone)"
  return moment(timePart, "HH:mm").format("h:mm A"); // Convert to 12-hour format with AM/PM
};

export default function PrayerTimesPage() {
  const currentMonth = moment().format("MMMM");
  const currentDate = moment().format("D"); // Current day in the month
  const currentYear = new Date().getFullYear(); // Current year

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const [prayerTimesData, setPrayerTimesData] = useState<PrayerTimesData>({});
  const [loading, setLoading] = useState<boolean>(false);

  // For scrolling and highlighting today's row
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);

  // Static list of months
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Get current year and month index based on selected month
  const getYearAndMonth = (monthName: string) => {
    const year = new Date().getFullYear(); // Current year
    const monthIndex = months.indexOf(monthName) + 1; // Get the month index (1-12)
    return { month: monthIndex, year };
  };

  useEffect(() => {
    if (selectedMonth) {
      const fetchPrayerTimes = async () => {
        const { month, year } = getYearAndMonth(selectedMonth);
        setLoading(true);
        try {
          const response = await axios.get(
            `https://api.aladhan.com/v1/calendarByCity/${year}/${month}`, {
              params: {
                city: 'FortSmith',
                country: 'US',
                state: 'Arkansas',
                school: 0,
                adjustment: 1,
                method: 2,
                shafaq: 'ahmer',
                latitudeAdjustmentMethod: 3,
                calendarMethod: 'UAQ'
              },
              headers: {
                'accept': 'application/json'
              }
            }
          );

          const formattedData = formatPrayerTimes(response.data.data);
          setPrayerTimesData(formattedData);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching prayer times:", error);
          setLoading(false);
        }
      };

      fetchPrayerTimes();
    }
  }, [selectedMonth]);

  // Helper function to format prayer times
  const formatPrayerTimes = (data: any[]): PrayerTimesData => {
    const formatted: PrayerTimesData = {};

    data.forEach((item) => {
      const monthYear = `${item.date.gregorian.month.en} ${item.date.gregorian.year}`;

      if (!formatted[monthYear]) {
        formatted[monthYear] = [];
      }

      formatted[monthYear].push({
        date: item.date.gregorian.day,
        day: item.date.gregorian.weekday.en,
        fajr: formatTime(item.timings.Fajr),
        sunrise: formatTime(item.timings.Sunrise),
        dhuhr: formatTime(item.timings.Dhuhr),
        asr: formatTime(item.timings.Asr),
        maghrib: formatTime(item.timings.Maghrib),
        isha: formatTime(item.timings.Isha),
      });
    });

    return formatted;
  };

  useEffect(() => {
    const todayRowIndex = prayerTimesData[`${selectedMonth} ${currentYear}`]?.findIndex(
      (day) => parseInt(day.date, 10) === parseInt(currentDate, 10)
    );

    if (todayRowIndex !== undefined && todayRowIndex >= 0) {
      rowRefs.current[todayRowIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [prayerTimesData, selectedMonth]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-600 to-green-700 text-white overflow-hidden py-20">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="container relative py-20 md:py-28 flex flex-col items-center text-center">
          <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl max-w-4xl mb-6">
            Prayer Times
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl">
            Stay on top of prayer timings with accurate data tailored for your location.
          </p>
        </div>
      </section>

      {/* Prayer Times Content */}
      <div className="container px-4 md:px-6 py-12">
        <div className="max-w-md mx-auto mb-8">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger>
              <SelectValue placeholder="Select month" />
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

        <Card className="overflow-hidden">
          <CardHeader className="bg-[#0D7A3B] text-white">
            <CardTitle className="text-center">{selectedMonth} Prayer Times</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted">
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Day</th>
                    <th className="px-4 py-3 text-center">Fajr</th>
                    <th className="px-4 py-3 text-center">Sunrise</th>
                    <th className="px-4 py-3 text-center">Dhuhr</th>
                    <th className="px-4 py-3 text-center">Asr</th>
                    <th className="px-4 py-3 text-center">Maghrib</th>
                    <th className="px-4 py-3 text-center">Isha</th>
                  </tr>
                </thead>
                <tbody>
                  {prayerTimesData[`${selectedMonth} ${currentYear}`]?.map((day, index) => (
                    <tr
                      key={day.date}
                      ref={(el) => { rowRefs.current[index] = el; }}
                      className={index % 2 === 0 ? "bg-white" : "bg-muted/30"}
                      style={parseInt(day.date, 10) === parseInt(currentDate, 10) && selectedMonth === currentMonth ? { backgroundColor: "#0D8A3B" } : {}}
                    >
                      <td className="px-4 py-3 border-t">{day.date}</td>
                      <td className="px-4 py-3 border-t">{day.day}</td>
                      <td className="px-4 py-3 border-t text-center">{day.fajr}</td>
                      <td className="px-4 py-3 border-t text-center">{day.sunrise}</td>
                      <td className="px-4 py-3 border-t text-center">{day.dhuhr}</td>
                      <td className="px-4 py-3 border-t text-center">{day.asr}</td>
                      <td className="px-4 py-3 border-t text-center">{day.maghrib}</td>
                      <td className="px-4 py-3 border-t text-center">{day.isha}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
