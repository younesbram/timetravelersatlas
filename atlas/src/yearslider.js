import React from 'react';

const YearSlider = ({ year, setYear }) => {
  return (
    <div>
      <input
        type="range"
        min="-5000"
        max="2022"
        value={year}
        onChange={(e) => setYear(e.target.value)}
      />
      <span>{year} (Common Era)</span>
    </div>
  );
};

export default YearSlider;
