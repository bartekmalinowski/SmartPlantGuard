import React, { useState, useEffect } from 'react';
import { OperatingMode } from '../types.js';

const ToggleSwitch = ({ checked, onChange, labelLeft, labelRight }) => (
  <div className="flex items-center space-x-3">
    <span className={`font-medium ${!checked ? 'text-green-400' : 'text-gray-400'}`}>{labelLeft}</span>
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
      <div className="w-14 h-7 bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-green-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
    </label>
    <span className={`font-medium ${checked ? 'text-green-400' : 'text-gray-400'}`}>{labelRight}</span>
  </div>
);

const Controls = ({ config, onModeChange, onWaterNow, onConfigChange }) => {
  const [humidityThreshold, setHumidityThreshold] = useState(config.humidityThreshold);
  const [maxPumpTime, setMaxPumpTime] = useState(config.maxPumpTime);

  useEffect(() => {
    setHumidityThreshold(config.humidityThreshold);
    setMaxPumpTime(config.maxPumpTime);
  }, [config]);
  
  const handleSave = () => {
      onConfigChange({ ...config, humidityThreshold, maxPumpTime });
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
      <h2 className="text-2xl font-semibold text-gray-200 mb-6">System Controls</h2>
      <div className="space-y-8">
        {/* Mode & Manual Pump */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-4 bg-gray-700/50 rounded-lg">
            <ToggleSwitch
                checked={config.mode === OperatingMode.Auto}
                onChange={(isChecked) => onModeChange(isChecked ? OperatingMode.Auto : OperatingMode.Manual)}
                labelLeft="Manual"
                labelRight="Auto"
            />
            <button
                onClick={onWaterNow}
                disabled={config.mode === OperatingMode.Auto}
                className="w-full md:w-auto px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200"
            >
                Water Now
            </button>
        </div>

        {/* Sliders for config */}
        <div>
            <h3 className="text-lg font-medium text-gray-300 mb-4">Automatic Mode Settings</h3>
            <div className="space-y-6">
                <div>
                    <label htmlFor="humidity" className="flex justify-between text-sm font-medium text-gray-400 mb-2">
                        <span>Humidity Threshold (%)</span>
                        <span className="font-bold text-green-400">{humidityThreshold}%</span>
                    </label>
                    <input
                        id="humidity"
                        type="range"
                        min="0"
                        max="100"
                        value={humidityThreshold}
                        onChange={(e) => setHumidityThreshold(Number(e.target.value))}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer range-thumb"
                    />
                </div>
                <div>
                    <label htmlFor="pump-time" className="flex justify-between text-sm font-medium text-gray-400 mb-2">
                        <span>Max Pump Time (seconds)</span>
                        <span className="font-bold text-green-400">{maxPumpTime}s</span>
                    </label>
                    <input
                        id="pump-time"
                        type="range"
                        min="5"
                        max="60"
                        value={maxPumpTime}
                        onChange={(e) => setMaxPumpTime(Number(e.target.value))}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            </div>
             <div className="mt-8 flex justify-end">
                <button
                    onClick={handleSave}
                    className="px-6 py-2 font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 transition-colors duration-200"
                >
                    Save Settings
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Controls;