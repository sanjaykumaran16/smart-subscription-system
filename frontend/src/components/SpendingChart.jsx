import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import apiClient from '../api/client';

const COLORS = ['#22d3ee', '#2dd4bf', '#a78bfa', '#fb923c', '#f472b6', '#94a3b8'];

const CATEGORY_LABELS = {
  streaming: 'Streaming',
  software: 'Software',
  fitness: 'Fitness',
  food: 'Food',
  gaming: 'Gaming',
  other: 'Other',
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const { name, value } = payload[0].payload;
    return (
      <div className="custom-tooltip">
        <div className="custom-tooltip-label">{CATEGORY_LABELS[name] || name}</div>
        <div className="custom-tooltip-value">${Number(value).toFixed(2)}/mo</div>
      </div>
    );
  }
  return null;
};

export default function SpendingChart() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get('/analytics/by-category')
      .then((res) => {
        // Guard: ensure we always set an array
        const cats = Array.isArray(res.data?.categories) ? res.data.categories : [];
        setData(cats);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="chart-card skeleton" style={{ height: 280 }} />
    );
  }

  if (!data.length) {
    return (
      <div className="chart-card flex-center" style={{ height: 280 }}>
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <div className="empty-title">No spending data yet</div>
          <div className="empty-sub">Add subscriptions to see your breakdown</div>
        </div>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.category,
    value: item.monthlyTotal ?? 0,
  }));

  return (
    <div className="chart-card">
      <div className="chart-title">Spending by Category</div>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                {CATEGORY_LABELS[value] || value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
