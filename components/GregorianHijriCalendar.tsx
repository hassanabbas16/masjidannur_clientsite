'use client';

import { useState, useEffect } from 'react';
import moment from 'moment-hijri'; 
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const GregorianHijriCalendar: React.FC = () => {
  const [gregorianDate, setGregorianDate] = useState<string>('');
  const [hijriDate, setHijriDate] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    const currentGregorian = moment().format('MMMM Do YYYY');
    const currentHijri = moment().format('iMMMM iDo iYYYY');
    setGregorianDate(currentGregorian);
    setHijriDate(currentHijri);
  }, []);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    const gregorian = moment(date).format('MMMM Do YYYY');
    const hijri = moment(date).format('iMMMM iDo iYYYY');
    setGregorianDate(gregorian);
    setHijriDate(hijri);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-[300px] mx-auto my-4 min-h-[500px]">
      <h2 className="text-2xl sm:text-3xl font-heading font-semibold text-[#0D7A3B] mb-4 text-center">
        Gregorian & Hijri Calendar
      </h2>
      <div className="mb-4 text-center">
        <h3 className="text-lg sm:text-xl font-semibold text-[#0D7A3B] mb-3">Select Date</h3>
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          className="react-calendar shadow-lg rounded-lg w-full border-2 border-[#0D7A3B]"
        />
      </div>
      <div className="text-center space-y-4">
        <div className="mb-3">
          <h3 className="text-lg sm:text-xl font-semibold text-[#0D7A3B] mb-2">Gregorian Date</h3>
          <p className="text-base sm:text-lg font-medium text-[#555]">{gregorianDate}</p>
        </div>
        <div className="mb-3">
          <h3 className="text-lg sm:text-xl font-semibold text-[#0D7A3B] mb-2">Hijri Date</h3>
          <p className="text-base sm:text-lg font-medium text-[#555]">{hijriDate}</p>
        </div>
      </div>
    </div>
  );
};

export default GregorianHijriCalendar;
