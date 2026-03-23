import React from 'react';
import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// A nice color palette for our charts
const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const DynamicChart = ({ config }) => {
  // If no config is provided or it's malformed, don't render
  if (!config || !config.data || config.data.length === 0) {
    return <div className="text-slate-500 text-sm p-4 text-center">No chart data available.</div>;
  }

  const { chartType, data, xAxisKey, yAxisKey } = config;

  const renderChart = () => {
    switch (chartType) {
      case 'BarChart':
        return (
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey={xAxisKey} stroke="#64748b" fontSize={12} tickMargin={10} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }}/>
            <Bar dataKey={yAxisKey} fill={COLORS[0]} radius={[4, 4, 0, 0]} />
          </BarChart>
        );

      case 'LineChart':
        return (
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey={xAxisKey} stroke="#64748b" fontSize={12} tickMargin={10} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }}/>
            <Line type="monotone" dataKey={yAxisKey} stroke={COLORS[1]} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
          </LineChart>
        );

      case 'PieChart':
        return (
          <PieChart>
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey={yAxisKey}
              nameKey={xAxisKey}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        );

      default:
        // Fallback to a simple table if the AI suggests an unsupported chart type
        return (
          <div className="overflow-x-auto w-full">
            <table className="min-w-full text-sm text-left text-slate-500">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-3">{xAxisKey}</th>
                  <th className="px-6 py-3">{yAxisKey}</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={idx} className="bg-white border-b hover:bg-slate-50">
                    <td className="px-6 py-4">{row[xAxisKey]}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{row[yAxisKey]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
    }
  };

  return (
    <div className="w-full h-80 bg-white rounded-xl border border-slate-100 shadow-sm p-4 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

export default DynamicChart;