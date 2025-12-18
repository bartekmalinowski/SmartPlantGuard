import React from 'react';

const ChartCard = ({ title, children }) => {
  return (
    <div className="bg-gray-800 p-4 md:p-6 rounded-xl shadow-lg border border-gray-700">
      <h3 className="text-lg font-semibold text-gray-200 mb-4">{title}</h3>
      {children}
    </div>
  );
};

export default ChartCard;