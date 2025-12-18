import React from 'react';

const StatusCard = ({ icon, title, value, color = 'text-gray-200' }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-green-500 transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
        {icon && <div className={`p-3 bg-gray-700/50 rounded-full ${color}`}>
            {icon}
        </div>}
      </div>
    </div>
  );
};

export default StatusCard;