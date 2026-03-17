import React, { useMemo } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, Legend
} from 'recharts';
import { BarChart3, PieChartIcon, TrendingUp } from 'lucide-react';
import { differenceInDays, subDays, format } from 'date-fns';

const COLORS = {
  safe: '#3b82f6',
  low: '#f59e0b',
  expiring: '#ef4444',
  taken: '#10b981',
  scheduled: '#6366f1',
};

const MedicineInsights = ({ medicines }) => {
  const today = new Date();

  // Stock Status Data
  const stockData = useMemo(() => {
    let safe = 0, low = 0, expiring = 0;

    medicines.forEach(med => {
      const isLowStock = med.stock < 10;
      let isExpiring = false;

      if (med.expiryDate) {
        const expiry = med.expiryDate.toDate ? med.expiryDate.toDate() : new Date(med.expiryDate);
        const daysLeft = differenceInDays(expiry, today);
        if (daysLeft <= 30) isExpiring = true;
      }

      if (isExpiring) expiring++;
      else if (isLowStock) low++;
      else safe++;
    });

    return [
      { name: 'Safe', value: safe, color: COLORS.safe },
      { name: 'Low Stock', value: low, color: COLORS.low },
      { name: 'Expiring', value: expiring, color: COLORS.expiring },
    ].filter(d => d.value > 0);
  }, [medicines]);

  // Daily Compliance Data (mock based on existing data)
  const dailyComplianceData = useMemo(() => {
    const scheduledMeds = medicines.filter(m => m.scheduleTimes && m.scheduleTimes.length > 0);
    const totalScheduledPerDay = scheduledMeds.reduce((sum, med) => sum + (med.scheduleTimes?.length || 0), 0);

    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i);
      const dateKey = format(date, 'yyyy-MM-dd');
      
      let takenCount = 0;
      scheduledMeds.forEach(med => {
        if (med.taken && med.taken[dateKey]) {
          takenCount += med.taken[dateKey].length;
        }
      });

      return {
        day: format(date, 'EEE'),
        date: format(date, 'MMM d'),
        scheduled: totalScheduledPerDay,
        taken: takenCount,
      };
    });
  }, [medicines]);

  // Weekly Adherence Data
  const weeklyAdherenceData = useMemo(() => {
    return dailyComplianceData.map(d => ({
      ...d,
      adherence: d.scheduled > 0 ? Math.round((d.taken / d.scheduled) * 100) : 0,
    }));
  }, [dailyComplianceData]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 text-sm">
          <p className="font-semibold text-slate-700 mb-1">{label}</p>
          {payload.map((entry, idx) => (
            <p key={idx} style={{ color: entry.color }} className="font-medium">
              {entry.name}: {entry.value}{entry.name === 'adherence' ? '%' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Medicine Insights</h2>
        <p className="text-slate-500 mt-1 text-sm">Analytics and compliance tracking</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Status Pie Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <PieChartIcon className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Stock Status</h3>
          </div>

          {stockData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm">
              No medicines to display
            </div>
          ) : (
            <div className="flex items-center">
              <ResponsiveContainer width="60%" height={300}>
                <PieChart>
                  <Pie
                    data={stockData}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={110}
                    paddingAngle={4}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {stockData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {stockData.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <div>
                      <p className="text-sm font-medium text-slate-700">{item.name}</p>
                      <p className="text-xs text-slate-400">{item.value} medicines</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Daily Compliance Bar Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Daily Compliance</h3>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyComplianceData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="scheduled" fill={COLORS.scheduled} name="Scheduled" radius={[6, 6, 0, 0]} barSize={16} />
              <Bar dataKey="taken" fill={COLORS.taken} name="Taken" radius={[6, 6, 0, 0]} barSize={16} />
              <Legend 
                wrapperStyle={{ paddingTop: '16px' }}
                formatter={(value) => <span className="text-xs text-slate-600 font-medium">{value}</span>}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Adherence Line Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-2">
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Weekly Adherence</h3>
          </div>

          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={weeklyAdherenceData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis 
                axisLine={false} tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                domain={[0, 100]}
                tickFormatter={v => `${v}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="adherence"
                stroke={COLORS.safe}
                strokeWidth={3}
                dot={{ r: 5, fill: COLORS.safe, stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: COLORS.safe, stroke: '#fff', strokeWidth: 3 }}
                name="Adherence %"
                animationDuration={1200}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MedicineInsights;
