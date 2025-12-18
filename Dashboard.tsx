// src/Dashboard.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, ESP32_IP } from './supabaseClient';
import { toast } from 'react-hot-toast'; // <-- 1. IMPORTUJ FUNKCJĘ TOAST

// Rejestracja komponentów Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface LiveData {
  temperature: number;
  soil_humidity: number;
  pump1: boolean;
}

interface HistoricalData {
  id: number;
  timestamp: string;
  temperature: number;
}

const Dashboard: React.FC = () => {
  const [liveData, setLiveData] = useState<LiveData | null>(null);
  const [historyData, setHistoryData] = useState<HistoricalData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Ref do śledzenia, czy powiadomienie o niskiej wilgotności zostało już wysłane
  const lowHumidityNotified = useRef(false);

  // 1. POBIERANIE DANYCH NA ŻYWO (Z ESP32)
  const fetchLiveData = useCallback(async () => {
    try {
      const response = await fetch(`${ESP32_IP}/api/status`);
      if (!response.ok) {
        throw new Error('Problem z połączeniem z ESP32');
      }
      const data = await response.json();
      setLiveData({
        temperature: parseFloat(data.temperature),
        soil_humidity: parseFloat(data.soil_humidity),
        pump1: data.pump1,
      });
    } catch (error) {
      console.error('Błąd pobierania danych na żywo:', error);
      // Nie pokazujemy toastu tutaj, aby nie spamować przy każdym nieudanym odświeżeniu
    }
  }, []);

  // 2. STEROWANIE POMPĄ (WYŁĄCZNIE PRZEZ ESP32)
  const togglePump = async () => {
    if (!liveData) return;
    const currentState = liveData.pump1;
    const newState = !currentState;
    
    // Używamy funkcji toast.promise, aby pokazać stan operacji
    toast.promise(
      fetch(`${ESP32_IP}/api/pump?p=1&s=${newState ? 1 : 0}`),
      {
        loading: 'Wysyłanie polecenia...',
        success: () => {
          // Optymistyczna aktualizacja UI
          setLiveData(prev => prev ? ({ ...prev, pump1: newState }) : null);
          setTimeout(fetchLiveData, 500); // Szybkie odświeżenie
          return `Pompa została ${newState ? 'WŁĄCZONA' : 'WYŁĄCZONA'}.`;
        },
        error: 'Nie udało się przełączyć pompy!',
      }
    );
  };

  // 3. POBIERANIE DANYCH HISTORYCZNYCH (Z SUPABASE)
  const fetchHistoryData = async () => {
    const { data, error } = await supabase
      .from('measurements') // Nazwa Twojej tabeli
      .select('id, timestamp, temperature')
      .order('timestamp', { ascending: false })
      .limit(50); // Ostatnie 50 wpisów

    if (error) {
      console.error('Błąd pobierania historii z Supabase:', error);
      toast.error('Błąd pobierania danych historycznych.'); // Powiadomienie o błędzie
      return;
    }
    setHistoryData(data as HistoricalData[]);
  };

  useEffect(() => {
    setLoading(false);
    // Uruchomienie interwałów dla odświeżania
    fetchLiveData();
    fetchHistoryData();
    const liveInterval = setInterval(fetchLiveData, 2000); // Na żywo co 2s
    const historyInterval = setInterval(fetchHistoryData, 30000); // Historia co 30s

    return () => {
      clearInterval(liveInterval);
      clearInterval(historyInterval);
    };
  }, [fetchLiveData]);

  // <-- 2. NOWY EFEKT DO OBSŁUGI POWIADOMIEŃ WARUNKOWYCH
  useEffect(() => {
    if (liveData) {
      const humidityThreshold = 30.0; // Ustaw próg wilgotności
      
      if (liveData.soil_humidity < humidityThreshold && !lowHumidityNotified.current) {
        toast.error('Niska wilgotność gleby! Rozważ włączenie pompy.', {
          duration: 6000, // dłuższe powiadomienie
          icon: '💧',
        });
        lowHumidityNotified.current = true; // Zaznacz, że powiadomienie zostało wysłane
      } else if (liveData.soil_humidity >= humidityThreshold) {
        // Zresetuj flagę, gdy wilgotność wróci do normy
        lowHumidityNotified.current = false;
      }
    }
  }, [liveData]); // Ten efekt uruchomi się przy każdej zmianie liveData


  // Konfiguracja wykresu
  const chartData = {
    labels: historyData.map(d => new Date(d.timestamp).toLocaleTimeString()).reverse(), // Odwracamy, aby oś czasu była od lewej do prawej
    datasets: [
      {
        label: 'Temperatura [°C]',
        data: historyData.map(d => d.temperature).reverse(), // Również odwracamy dane
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  if (loading || !liveData) return <div className="p-8 text-xl">Ładowanie...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans">
      <header className="bg-blue-600 text-white p-4 rounded-lg shadow-lg mb-6">
        <h1 className="text-3xl font-bold">IoT Dashboard - ESP32 & Supabase</h1>
      </header>

      {/* Sekcja Danych na Żywo i Sterowania */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        
        {/* Odczyty z ESP32 na żywo */}
        <div className="bg-white p-6 rounded-lg shadow-md col-span-2">
          <h2 className="text-xl font-semibold mb-4">Stan Systemu (Live z ESP32)</h2>
          <div className="grid grid-cols-3 gap-4">
            <DataCard label="Temperatura (GPIO2)" value={`${liveData.temperature.toFixed(1)} °C`} />
            <DataCard label="Wilgotność Gleby (GPIO34)" value={`${liveData.soil_humidity.toFixed(1)} %`} />
            <DataCard label="HC-SR04 Odległość" value="Brak Danych w tym UI" />
          </div>
        </div>

        {/* Sterowanie Pompą */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Sterowanie Pompą (GPIO14)</h2>
          <div className="flex flex-col items-center">
            <div className={`text-4xl font-bold mb-4 ${liveData.pump1 ? 'text-green-600' : 'text-red-600'}`}>
              {liveData.pump1 ? 'WŁĄCZONA' : 'WYŁĄCZONA'}
            </div>
            <button
              onClick={togglePump}
              className={`py-3 px-8 rounded-full text-white font-bold transition duration-200 ${
                liveData.pump1 ? 'bg-red-500 hover:bg-red-700' : 'bg-green-500 hover:bg-green-700'
              }`}
            >
              {liveData.pump1 ? 'WYŁĄCZ' : 'WŁĄCZ'}
            </button>
          </div>
        </div>
      </div>

      {/* Sekcja Wykresu Historycznego */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Historia Temperatury (Z Supabase)</h2>
        <div className="h-96">
          {historyData.length > 0 ? (
            <Line options={{ responsive: true, maintainAspectRatio: false }} data={chartData} />
          ) : (
            <p>Ładowanie danych historycznych...</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Pomocniczy komponent do kart danych
const DataCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="border border-gray-200 p-4 rounded-lg text-center">
    <div className="text-sm text-gray-500">{label}</div>
    <div className="text-2xl font-bold mt-1">{value}</div>
  </div>
);

export default Dashboard;