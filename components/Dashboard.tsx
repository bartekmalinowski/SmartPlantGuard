import React from 'react';
import StatusCard from './StatusCard.js';
import { MoistureIcon, WaterLevelIcon, TemperatureIcon, BatteryIcon, PumpIcon } from './icons.js';

const Dashboard = ({ sensorData }) => {
  const { soilMoisture, waterLevel, temperature, battery, pumpOn, mode, lastReading } = sensorData;

  const getMoistureColor = (value) => {
    if (value < 30) return 'text-red-400';
    if (value < 60) return 'text-yellow-400';
    return 'text-blue-400';
  };

  const getWaterLevelColor = (value) => {
    if (value < 20) return 'text-red-400';
    if (value < 50) return 'text-yellow-400';
    return 'text-blue-400';
  };

  const getBatteryColor = (value) => {
    if (value < 20) return 'text-red-400';
    if (value < 50) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getPumpStatusColor = (isOn) => {
      return isOn ? 'text-green-400' : 'text-gray-400';
  }

  const timeSince = (dateString) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
    if (seconds < 5) return "just now";
    return `${seconds} seconds ago`;
  };

  return (
    <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-200">Live Status</h2>
            <p className="text-sm text-gray-400">Last updated: {timeSince(lastReading)}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatusCard 
                icon={<MoistureIcon className="w-8 h-8"/>} 
                title="Soil Moisture" 
                value={`${soilMoisture.toFixed(1)}%`}
                color={getMoistureColor(soilMoisture)}
            />
            <StatusCard 
                icon={<WaterLevelIcon className="w-8 h-8"/>} 
                title="Water Level" 
                value={`${waterLevel.toFixed(1)}%`}
                color={getWaterLevelColor(waterLevel)}
            />
            <StatusCard 
                icon={<TemperatureIcon className="w-8 h-8"/>} 
                title="Temperature" 
                value={`${temperature.toFixed(1)}°C`}
                color="text-orange-400"
            />
            <StatusCard 
                icon={<BatteryIcon className="w-8 h-8"/>} 
                title="Battery" 
                value={`${battery.toFixed(1)}%`}
                color={getBatteryColor(battery)}
            />
            <StatusCard 
                icon={<PumpIcon className={`w-8 h-8 ${pumpOn ? 'animate-pulse' : ''}`}/>} 
                title="Pump Status" 
                value={pumpOn ? 'ON' : 'OFF'}
                color={getPumpStatusColor(pumpOn)}
            />
            <StatusCard 
                title="Operating Mode" 
                value={mode}
                color="text-purple-400"
            />
        </div>
    </div>
  );
};

export default Dashboard;