// src/pages/SettingsPage.tsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { ESP32_IP } from '../supabaseClient';
import { useDeviceData } from '../contexts/DeviceContext';

const ToggleSwitch = ({ checked, onChange, labelLeft, labelRight }) => (
  <div className="flex items-center space-x-4">
    <span className={`font-medium transition-colors ${!checked ? 'text-aurora-primary' : 'text-gray-500'}`}>{labelLeft}</span>
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
      <div className="w-14 h-7 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-aurora-primary/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-aurora-primary"></div>
    </label>
    <span className={`font-medium transition-colors ${checked ? 'text-aurora-primary' : 'text-gray-500'}`}>{labelRight}</span>
  </div>
);

const SettingsPage = () => {
  const { liveData } = useDeviceData();
  const [settings, setSettings] = useState({ humidityThreshold: 30, pumpDuration: 15, waterLevelThreshold: 20 });
  const [systemMode, setSystemMode] = useState('Auto');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (liveData) {
      setSettings(liveData.settings);
      setSystemMode(liveData.systemMode);
      setIsLoading(false);
    }
  }, [liveData]);

  const handleModeChange = (isAuto: boolean) => {
    const newMode = isAuto ? 'Auto' : 'Manual';
    setSystemMode(newMode);
    
    toast.promise(
      fetch(`${ESP32_IP}/api/set-mode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: newMode }),
      }).then(res => {
        if (!res.ok) throw new Error('Failed to change mode on device.');
      }),
      {
        loading: `Switching to ${newMode} mode...`,
        success: `System is now in ${newMode} mode!`,
        error: (err) => err.message,
      }
    );
  };

  const handleSave = () => {
    const payload = {
      humidityThreshold: settings.humidityThreshold,
      pumpDuration: settings.pumpDuration,
      waterLevelThreshold: settings.waterLevelThreshold,
    };
    toast.promise(
      fetch(`${ESP32_IP}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(response => {
        if (!response.ok) {
          throw new Error('Failed to save settings on the device.');
        }
      }),
      {
        loading: 'Saving settings to device...',
        success: 'Settings saved successfully!',
        error: (err) => `Error: ${err.message}`,
      }
    );
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-full animate-pulse">
            <p className="text-gray-400 text-lg">Loading configuration from device...</p>
        </div>
    );
  }

  return (
    <div className="animate-fade-in-up max-w-2xl mx-auto">
      <header className="mb-10">
        <h1 className="text-5xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-2">Configure the brain of your PlantGuard.</p>
      </header>
      
      <div className="bg-aurora-surface/50 border border-aurora-border rounded-2xl p-8 backdrop-blur-sm mb-8">
        <h3 className="text-lg font-medium text-gray-200 mb-2">Operating Mode</h3>
        <p className="text-sm text-gray-500 mb-6">Choose between fully automatic or manual pump control.</p>
        <ToggleSwitch
          checked={systemMode === 'Auto'}
          onChange={handleModeChange}
          labelLeft="Manual"
          labelRight="Auto"
        />
      </div>

      <div className="bg-aurora-surface/50 border border-aurora-border rounded-2xl p-8 space-y-8 backdrop-blur-sm">
        <h3 className="text-lg font-medium text-gray-200 -mb-2">Automatic Mode Parameters</h3>
        <div>
          <label className="flex justify-between text-lg font-medium text-gray-200">
            <span>Humidity Threshold</span>
            <span className="font-mono text-aurora-primary">{settings.humidityThreshold}%</span>
          </label>
          <p className="text-sm text-gray-500 mb-4">Watering will start when moisture drops below this value.</p>
          <input type="range" min="0" max="100" value={settings.humidityThreshold}
            onChange={(e) => setSettings(s => ({ ...s, humidityThreshold: Number(e.target.value) }))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-thumb"
          />
        </div>
        <div>
          <label className="flex justify-between text-lg font-medium text-gray-200">
            <span>Watering Duration</span>
            <span className="font-mono text-aurora-primary">{settings.pumpDuration}s</span>
          </label>
          <p className="text-sm text-gray-500 mb-4">How long the pump will run during a watering cycle.</p>
          <input type="range" min="5" max="60" value={settings.pumpDuration}
            onChange={(e) => setSettings(s => ({ ...s, pumpDuration: Number(e.target.value) }))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-thumb"
          />
        </div>
        <div>
          <label className="flex justify-between text-lg font-medium text-gray-200">
            <span>Water Level Threshold</span>
            <span className="font-mono text-aurora-primary">{settings.waterLevelThreshold} cm</span>
          </label>
          <p className="text-sm text-gray-500 mb-4">Display a warning when water distance is greater than this value.</p>
          <input type="range" min="0" max="30" value={settings.waterLevelThreshold}
            onChange={(e) => setSettings(s => ({ ...s, waterLevelThreshold: Number(e.target.value) }))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-thumb"
          />
        </div>
        
        <div className="pt-4 flex justify-end">
          <button onClick={handleSave}
            className="px-8 py-3 rounded-xl bg-aurora-primary text-gray-900 font-bold shadow-[0_4px_14px_0_rgba(45,212,191,0.3)] hover:bg-opacity-80 transition-all duration-300">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;