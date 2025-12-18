// src/pages/HistoryPage.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts';

// --- DEFINICJE TYPÓW ---
interface DataPoint {
  timestamp: string;
  [key: string]: any;
}

interface ChartDataState {
  humidity: DataPoint[];
  temperature: DataPoint[];
  waterLevel: DataPoint[];
}

// --- KLUCZOWA POPRAWKA TUTAJ ---
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800/80 backdrop-blur-sm p-3 rounded-lg border border-aurora-border shadow-lg">
        <p className="label text-sm text-gray-400">{`${new Date(label).toLocaleString()}`}</p>
        {/* Usunięto 'style' i dodano klasę 'text-white' dla stałego białego koloru */}
        <p className="intro text-lg font-bold text-white">
          {`${payload[0].name}: ${payload[0].value.toFixed(1)}`}
        </p>
      </div>
    );
  }
  return null;
};

// Komponent Wykresu (bez zmian)
const ChartWrapper = ({ title, data, dataKey, name, color, unit }: any) => (
  <div className="bg-aurora-surface/50 border border-aurora-border rounded-2xl p-6 backdrop-blur-sm">
    <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
    <ResponsiveContainer width="100%" height={300} key={`chart-${data.length}`}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <defs>
          <linearGradient id={`color-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
            <stop offset="95%" stopColor={color} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="1 5" stroke="rgba(255, 255, 255, 0.1)" />
        <XAxis dataKey="timestamp" 
          tickFormatter={(time) => new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          stroke="#888888" 
          fontSize={12} 
        />
        <YAxis stroke="#888888" fontSize={12} unit={unit} domain={['dataMin - 1', 'dataMax + 1']} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey={dataKey} stroke="transparent" fillOpacity={1} fill={`url(#color-${dataKey})`} />
        <Line type="monotone" dataKey={dataKey} name={name} stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

// Główny komponent strony
const HistoryPage = () => {
  const [chartData, setChartData] = useState<ChartDataState>({ temperature: [], humidity: [], waterLevel: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);

      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const twoDaysAgoISO = twoDaysAgo.toISOString();

      const { data, error } = await supabase
        .from('measurements')
        .select('timestamp, temperature, humidity, water_level_cm')
        .order('timestamp', { ascending: true })
        .gte('timestamp', twoDaysAgoISO);
      
      if (error) {
        toast.error("Failed to load historical data.");
        console.error(error);
      } else if (data) {
        setChartData({
          humidity: data.map(item => ({ timestamp: item.timestamp, humidity: item.humidity })),
          temperature: data.map(item => ({ timestamp: item.timestamp, temperature: item.temperature })),
          waterLevel: data.map(item => ({ timestamp: item.timestamp, water_level_cm: item.water_level_cm })),
        });
      }
      setIsLoading(false);
    };

    fetchHistory();

    const channel = supabase.channel('measurements-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'measurements' },
        (payload) => {
          console.log('New measurement received!', payload.new);
          toast('New measurement received!', { icon: '📈' });
          
          const newMeasurement = payload.new as { timestamp: string; temperature: number; humidity: number; water_level_cm: number; };

          setChartData(prevData => {
            const newHumidityData = [...prevData.humidity, { timestamp: newMeasurement.timestamp, humidity: newMeasurement.humidity }];
            const newTemperatureData = [...prevData.temperature, { timestamp: newMeasurement.timestamp, temperature: newMeasurement.temperature }];
            const newWaterLevelData = [...prevData.waterLevel, { timestamp: newMeasurement.timestamp, water_level_cm: newMeasurement.water_level_cm }];
            
            if (newHumidityData.length > 1000) {
              newHumidityData.shift();
              newTemperatureData.shift();
              newWaterLevelData.shift();
            }

            return {
              humidity: newHumidityData,
              temperature: newTemperatureData,
              waterLevel: newWaterLevelData,
            };
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="animate-fade-in-up">
      <header className="mb-10">
        <h1 className="text-5xl font-bold text-white">Data History</h1>
        <p className="text-gray-400 mt-2">Analysis of sensor readings from the last 48 hours.</p>
      </header>

      {isLoading ? (
        <p className="text-center text-gray-400">Loading historical data...</p>
      ) : (
        <div className="space-y-8">
          {chartData.humidity.length > 0 ? (
            <>
              <ChartWrapper title="Soil Moisture" data={chartData.humidity} dataKey="humidity" name="Moisture" color="#38bdf8" unit="%" />
              <ChartWrapper title="Temperature" data={chartData.temperature} dataKey="temperature" name="Temperature" color="#f59e0b" unit="°C" />
              <ChartWrapper title="Water Level" data={chartData.waterLevel} dataKey="water_level_cm" name="Water Level" color="#818cf8" unit=" cm" />
            </>
          ) : (
            <div className="bg-aurora-surface/50 border border-aurora-border rounded-2xl p-12 backdrop-blur-sm text-center">
              <p className="text-gray-400">No data available for the last 48 hours.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;