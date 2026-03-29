import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { SIPResult } from '../types';

interface ChartsProps {
  data: SIPResult;
}

const COLORS = ['#0ea5e9', '#10b981']; // Sky-500, Emerald-500

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-sm">
        <p className="font-semibold text-slate-700 mb-1">Year {label}</p>
        <p className="text-sky-600">
          Inv: ${payload[0].value.toLocaleString()}
        </p>
        <p className="text-emerald-600">
          Val: ${payload[1].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export const GrowthChart: React.FC<ChartsProps> = ({ data }) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data.yearlyBreakdown}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="year" 
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickFormatter={(value) => `${(value / 1000)}k`}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="invested"
            name="Invested"
            stroke="#0ea5e9"
            fillOpacity={1}
            fill="url(#colorInvested)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="value"
            name="Total Value"
            stroke="#10b981"
            fillOpacity={1}
            fill="url(#colorValue)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const BreakdownChart: React.FC<ChartsProps> = ({ data }) => {
  const pieData = [
    { name: 'Invested', value: data.investedAmount },
    { name: 'Returns', value: data.estimatedReturns },
  ];

  return (
    <div className="h-64 w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => `$${value.toLocaleString()}`}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
      {/* Center Text Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
        <span className="text-xs text-slate-500 font-medium">Total Value</span>
        <span className="text-sm font-bold text-slate-800">${(data.totalValue / 1000).toFixed(1)}k</span>
      </div>
    </div>
  );
};
