'use client';
import { useState } from 'react';

const SpecialIslamicDays: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-[300px] mx-auto my-4 min-h-[500px]">
      <h2 className="text-2xl font-heading font-semibold text-[#0D7A3B] mb-4 text-center">
        Special Islamic Days
      </h2>
      <div className="overflow-hidden rounded-lg border-2 shadow-lg">
        <iframe
          src="https://www.islamicfinder.org/specialislamicdays"
          className="transition-transform duration-300 ease-in-out w-full"
          style={{ height: '400px', borderRadius: '10px', display: 'block', border: 'none' }}
          title="Special Islamic Days"
          scrolling="no"
        ></iframe>
      </div>
    </div>
  );
}

export default SpecialIslamicDays;
