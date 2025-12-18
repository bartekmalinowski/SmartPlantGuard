import React, { useState, useEffect } from 'react';

const TextInput = ({ label, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-green-500 focus:border-green-500"
    />
  </div>
);

const NumberInput = ({ label, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-green-500 focus:border-green-500"
    />
  </div>
);

const Settings = ({ config, onConfigChange }) => {
  const [localConfig, setLocalConfig] = useState(config);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleSave = () => {
    onConfigChange(localConfig);
  };

  const handleInputChange = (key, value) => {
    setLocalConfig(prev => ({ ...prev, [key]: value }));
  };
  
  const handleCalibrationChange = (key, value) => {
    setLocalConfig(prev => ({...prev, calibration: { ...prev.calibration, [key]: value }}));
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
      <h2 className="text-2xl font-semibold text-gray-200 mb-6">Device Settings</h2>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextInput label="Plant Name" value={localConfig.plantName} onChange={val => handleInputChange('plantName', val)} />
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Device ID</label>
            <p className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-gray-400">{localConfig.deviceId}</p>
          </div>
        </div>

        <div>
            <h3 className="text-lg font-medium text-gray-300 mb-4 border-t border-gray-700 pt-6">Sensor Calibration</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <NumberInput label="Moisture (Dry)" value={localConfig.calibration.moistureDry} onChange={val => handleCalibrationChange('moistureDry', val)} />
                 <NumberInput label="Moisture (Wet)" value={localConfig.calibration.moistureWet} onChange={val => handleCalibrationChange('moistureWet', val)} />
                 <NumberInput label="Water (Empty)" value={localConfig.calibration.waterEmpty} onChange={val => handleCalibrationChange('waterEmpty', val)} />
                 <NumberInput label="Water (Full)" value={localConfig.calibration.waterFull} onChange={val => handleCalibrationChange('waterFull', val)} />
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
  );
};

export default Settings;