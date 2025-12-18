import React from 'react';
import ChartCard from './ChartCard.js';
import StatusCard from './StatusCard.js';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const History = ({ historyData }) => {
  const { moisture, waterLevel, battery, temperature, wateringCycles, totalPumpTime } = historyData;

  const formatXAxis = (tickItem) => {
      return new Date(tickItem).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div>
        <h2 className="text-2xl font-semibold text-gray-200 mb-4">Historical Data (Last 7 Days)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <StatusCard title="Total Watering Cycles" value={String(wateringCycles)} color="text-blue-400" />
            <StatusCard title="Total Pump Runtime" value={`${Math.floor(totalPumpTime / 60)}m ${totalPumpTime % 60}s`} color="text-purple-400" />
        </div>
        <div className="space-y-6">
            <ChartCard title="Soil Moisture (%)">
                 <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={moisture}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                        <XAxis dataKey="time" tickFormatter={formatXAxis} stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" domain={[0, 100]}/>
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4a5568' }}/>
                        <Legend />
                        <Line type="monotone" dataKey="value" name="Moisture" stroke="#34d399" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </ChartCard>
             <ChartCard title="Water Level (%)">
                 <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={waterLevel}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                        <XAxis dataKey="time" tickFormatter={formatXAxis} stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" domain={[0, 100]} />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4a5568' }}/>
                        <Legend />
                        <Line type="monotone" dataKey="value" name="Water Level" stroke="#60a5fa" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </ChartCard>
             <ChartCard title="Temperature (°C)">
                 <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={temperature}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                        <XAxis dataKey="time" tickFormatter={formatXAxis} stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" domain={['dataMin - 2', 'dataMax + 2']}/>
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4a5568' }}/>
                        <Legend />
                        <Line type="monotone" dataKey="value" name="Temperature" stroke="#f59e0b" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </ChartCard>
             <ChartCard title="Battery (%)">
                 <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={battery}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                        <XAxis dataKey="time" tickFormatter={formatXAxis} stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" domain={[0, 100]} />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4a5568' }}/>
                        <Legend />
                        <Line type="monotone" dataKey="value" name="Battery" stroke="#a78bfa" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </ChartCard>
        </div>
    </div>
  );
};

export default History;