// src/pages/HomePage.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ESP32_IP } from '../supabaseClient';
import { toast } from 'react-hot-toast';
import { DropletIcon, ThermometerIcon, GaugeIcon, WaterTankIcon } from '../components/icons';
import { useDeviceData } from '../contexts/DeviceContext';

const StatusIndicator = ({ status }) => {
  let indicatorColor, pulseColor, text;
  switch (status) {
    case 'connected':
      indicatorColor = 'bg-green-500'; pulseColor = 'bg-green-400'; text = 'Online'; break;
    case 'disconnected':
      indicatorColor = 'bg-red-500'; pulseColor = 'bg-red-400'; text = 'Offline'; break;
    default:
      indicatorColor = 'bg-yellow-500'; pulseColor = 'bg-yellow-400'; text = 'Connecting...'; break;
  }
  return (
    <div className="flex items-center gap-3">
      <span className="relative flex h-3 w-3">
        {status !== 'disconnected' && (<span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${pulseColor} opacity-75`}></span>)}
        <span className={`relative inline-flex rounded-full h-3 w-3 ${indicatorColor}`}></span>
      </span>
      <span className="text-sm font-medium text-gray-400">{text}</span>
    </div>
  );
};

const StatusCard = ({ icon, title, value, unit, colorClass, footer = null }) => (
  <div className="bg-aurora-surface/50 border border-aurora-border rounded-2xl p-6 backdrop-blur-sm transition-all duration-300 hover:border-aurora-primary/50 hover:shadow-2xl hover:shadow-aurora-primary/10">
    <div className="flex items-center gap-5">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${colorClass.bg} ${colorClass.text}`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-400">{title}</p>
        <p className="text-4xl font-bold text-gray-100">
          {value} <span className="text-2xl font-light text-gray-400">{unit}</span>
        </p>
      </div>
    </div>
    {footer && <p className="text-xs text-gray-500 mt-4">{footer}</p>}
  </div>
);

const ControlButton = ({ onClick, disabled, children, className }) => (
    <button onClick={onClick} disabled={disabled}
      className={`w-full py-3.5 rounded-xl font-bold text-lg transition-all duration-300 ease-in-out disabled:cursor-not-allowed ${className}`}>
      {children}
    </button>
);

const HomePage = () => {
  const { liveData, connectionStatus, updateState } = useDeviceData();
  const [isMeasuring, setIsMeasuring] = useState(false);

  const handleWaterNow = () => {
    toast.promise(
      fetch(`${ESP32_IP}/api/pump?s=1`), 
      {
        loading: 'Activating pump...',
        success: 'Manual watering cycle started!',
        error: (err) => {
          console.error(err);
          return 'Could not activate pump. System may be busy or water level is too low.';
        }
      }
    );
  };

  const handleMeasureNow = async () => {
    setIsMeasuring(true);
    const promise = fetch(`${ESP32_IP}/api/measure`);
    toast.promise(promise, {
      loading: 'Requesting new measurement...',
      success: 'Measurement complete and logged!',
      error: 'Failed to get measurement.',
    });
    try {
      const response = await promise;
      const data = await response.json();
      updateState(data);
    } catch (error) {
      console.error("Measurement failed:", error);
    } finally {
      setIsMeasuring(false);
    }
  };
  
  if (connectionStatus !== 'connected' || !liveData) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <StatusIndicator status={connectionStatus} />
        <p className="text-gray-400 text-lg">
          {connectionStatus === 'connecting' ? 'Connecting to SmartPlantGuard...' : 'Could not connect. Please check device power and network.'}
        </p>
      </div>
    );
  }

  const moistureColor = liveData.soilMoisture < 30 ? { bg: 'bg-red-500/10', text: 'text-red-400' } :
                        liveData.soilMoisture < 60 ? { bg: 'bg-yellow-500/10', text: 'text-yellow-400' } :
                        { bg: 'bg-blue-500/10', text: 'text-blue-400' };
  
  const waterLevelColor = liveData.isPumpSafetyLockActive ? { bg: 'bg-red-500/10', text: 'text-red-400' } :
                          liveData.water_level_cm > (liveData.settings.waterLevelThreshold * 0.5) ? { bg: 'bg-yellow-500/10', text: 'text-yellow-400' } :
                          { bg: 'bg-green-500/10', text: 'text-green-400' };

  const isAutoMode = liveData.systemMode === 'Auto';
  const isPumpDisabled = isAutoMode || liveData.pumpOn || liveData.isPumpSafetyLockActive;

  return (
    <div className="animate-fade-in-up">
      <header className="mb-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-5xl font-bold text-white">Dashboard</h1>
            <StatusIndicator status={connectionStatus} />
        </div>
        <p className="text-gray-400 mt-2">Live system status and manual controls.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatusCard 
          icon={<DropletIcon className="w-8 h-8" />} 
          title="Soil Moisture" 
          value={liveData.soilMoisture.toFixed(1)} 
          unit="%" 
          colorClass={moistureColor} 
          footer="Optimal range: 40-60%" 
        />
        <StatusCard 
          icon={<ThermometerIcon className="w-8 h-8" />} 
          title="Temperature" 
          value={liveData.temperature.toFixed(1)} 
          unit="°C" 
          colorClass={{ bg: 'bg-orange-500/10', text: 'text-orange-400' }} 
        />
        <StatusCard 
          icon={<WaterTankIcon className="w-8 h-8" />} 
          title="Water Level" 
          value={liveData.water_level_cm < 0 ? 'Error' : liveData.water_level_cm.toFixed(1)} 
          unit="cm from top" 
          colorClass={waterLevelColor}
          footer={`Warning threshold: > ${liveData.settings.waterLevelThreshold} cm`}
        />
        <StatusCard 
          icon={<GaugeIcon className="w-8 h-8" />} 
          title="System Mode" 
          value={liveData.systemMode} 
          unit="" 
          colorClass={{ bg: 'bg-violet-500/10', text: 'text-violet-400' }} 
        />
        
        <div className="md:col-span-2 xl:col-span-4 bg-aurora-surface/50 border border-aurora-border rounded-2xl p-8 backdrop-blur-sm space-y-4">
          <h3 className="font-semibold text-lg text-white">Actions</h3>
          
          {liveData.isPumpSafetyLockActive && (
            <div className="text-center text-yellow-400 text-sm p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              Pump is disabled due to low water level or sensor error.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ControlButton 
              onClick={handleWaterNow} 
              disabled={isPumpDisabled} 
              className="bg-aurora-primary text-gray-900 shadow-[0_4px_14px_0_rgba(45,212,191,0.2)] hover:bg-opacity-80 disabled:bg-gray-600 disabled:shadow-none"
            >
              {liveData.pumpOn ? 'Watering...' : 'Water Now'}
            </ControlButton>
            <ControlButton 
              onClick={handleMeasureNow} 
              disabled={isMeasuring} 
              className="bg-white/10 text-gray-200 border border-aurora-border hover:bg-white/20 disabled:opacity-50"
            >
              {isMeasuring ? 'Measuring...' : 'Measure & Log Now'}
            </ControlButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;