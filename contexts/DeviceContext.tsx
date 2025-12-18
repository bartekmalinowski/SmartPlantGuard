// src/contexts/DeviceContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ESP32_IP } from '../supabaseClient';
import { toast } from 'react-hot-toast';

const DeviceContext = createContext(null);

export const useDeviceData = () => useContext(DeviceContext);

export const DeviceProvider = ({ children }) => {
  const [liveData, setLiveData] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  const updateState = (data) => {
    if (data) {
      setLiveData({
        soilMoisture: data.soil_humidity ?? 0,
        temperature: data.temperature ?? 0,
        water_level_cm: data.water_level_cm ?? -1,
        pumpOn: data.pumpOn ?? false,
        systemMode: data.systemMode ?? 'Manual',
        settings: data.settings ?? { humidityThreshold: 30, pumpDuration: 15, waterLevelThreshold: 20 },
      });
    }
  };

  const fetchLiveData = useCallback(async () => {
    try {
      const response = await fetch(`${ESP32_IP}/api/status`);
      if (!response.ok) throw new Error('Device connection failed');
      const data = await response.json();
      updateState(data);
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Fetch error:', error);
      setConnectionStatus('disconnected');
    }
  }, []);

  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 2500);
    return () => clearInterval(interval);
  }, [fetchLiveData]);

  const value = { liveData, connectionStatus, updateState };

  return <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>;
};