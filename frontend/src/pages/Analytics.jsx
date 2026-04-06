import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="custom-tooltip">
        <div className="custom-tooltip-label">{label}</div>
        <div className="custom-tooltip-value">${Number(payload[0].value ?? 0).toFixed(2)}</div>
      </div>
    );
  }
  return null;
};

const fmt = (v) => (v != null ? `$${Number(v).toFixed(2)}` : '—');

export default function Analytics() {
  const [spend, setSpend]     = useState(null);
  const [categories, setCats] = useState([]);
  const [trend, setTrend]     = useState([]);
  const [topSubs, setTopSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [spendRes, catRes, trendRes, subsRes] = await Promise.all([
          apiClient.get('/analytics/spend'),
          apiClient.get('/analytics/by-category'),
          apiClient.get('/analytics/trend'),
          apiClient.get('/subscriptions'),
        ]);

        setSpend(spendRes.data || {});
        setCats(Array.isArray(catRes.data?.categories) ? catRes.data.categories : []);
        setTrend(Array.isArray(trendRes.data?.trend) ? trendRes.data.trend : []);

        const subs = Array.isArray(subsRes.data?.subscriptions) ? subsRes.data.subscriptions : [];
        const toMo = (s) => s.billingCycle === 'annually' ? s.cost / 12 : s.billingCycle === 'weekly' ? s.cost * 4.33 : s.cost;
        const sorted = [...subs]
          .filter((s) => s.status === 'active')
          .sort((a, b) => toMo(b) - toMo(a))
          .slice(0, 5);
        setTopSubs(sorted);
      } catch (err) {
        setApiError(err.response?.data?.error || 'Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const TICK = { fill: 'var(--text-muted)', fontSize: 12 };

  if (loading) {
    return (
      <div className="page-enter">
        <div className="page-header">
          <div className="skeleton" style={{ height: 32, width: 180, marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 14, width: 280 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
          {[0,1,2].map((i) => <div key={i} className="card skeleton" style={{ height: 88 }} />)}
        </div>
        <div className="grid-2">
          {[0,1].map((i) => <div key={i} className="chart-card skeleton" style={{ height: 280 }} />)}
          <div className="chart-card skeleton" style={{ height: 260, gridColumn: '1 / -1' }} />
        </div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="page-enter">
        <div className="page-header">
          <h1 className="page-title">Analytics</h1>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
          <div style={{ color: 'var(--danger)', fontWeight: 700, marginBottom: 8 }}>Could not load analytics</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>{apiError}</div>
          <div style={{ background: 'var(--bg-elevated)', borderRadius: 12, padding: '14px 20px', fontSize: 13, color: 'var(--text-secondary)', textAlign: 'left', maxWidth: 500, margin: '0 auto' }}>
            <div style={{ fontWeight: 700, marginBottom: 8, color: 'var(--cyan)' }}>First time? Run these commands:</div>
            <code style={{ display: 'block', color: 'var(--teal)', marginBottom: 4 }}>docker compose exec backend npx prisma migrate dev --name init</code>
            <code style={{ display: 'block', color: 'var(--teal)' }}>docker compose exec backend npm run seed</code>
          </div>
        </div>
      </div>
    );
  }

  const hasData = categories.length > 0 || trend.length > 0 || topSubs.length > 0;

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-sub">Insights into your subscription spending</p>
      </div>

      {/* Summary cards */}
      <div className="analytics-summary mb-24">
        <div className="card card-sm" style={{ textAlign: 'center' }}>
          <div className="analytics-stat-label">Monthly Total</div>
          <div className="analytics-stat-value text-cyan">{fmt(spend?.monthlyTotal)}</div>
        </div>
        <div className="card card-sm" style={{ textAlign: 'center' }}>
          <div className="analytics-stat-label">Annual Projection</div>
          <div className="analytics-stat-value text-teal">{fmt(spend?.annualTotal)}</div>
        </div>
        <div className="card card-sm" style={{ textAlign: 'center' }}>
          <div className="analytics-stat-label">Active Subscriptions</div>
          <div className="analytics-stat-value">{spend?.activeCount ?? '—'}</div>
        </div>
      </div>

      {!hasData ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>📊</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>No analytics data yet</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>Add subscriptions first, or seed the database with demo data.</div>
          <div style={{ background: 'var(--bg-elevated)', borderRadius: 12, padding: '14px 20px', fontSize: 13, color: 'var(--text-secondary)', textAlign: 'left', maxWidth: 480, margin: '0 auto' }}>
            <div style={{ fontWeight: 700, marginBottom: 8, color: 'var(--cyan)' }}>Seed demo data:</div>
            <code style={{ color: 'var(--teal)' }}>docker compose exec backend npm run seed</code>
          </div>
        </div>
      ) : (
        <div className="grid-2">
          {/* Line chart */}
          <div className="chart-card">
            <div className="chart-title">Monthly Spend Trend (6 months)</div>
            {trend.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">📈</div><div className="empty-title">No trend data</div></div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" tick={TICK} />
                  <YAxis tick={TICK} tickFormatter={(v) => `$${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="total" stroke="var(--cyan)" strokeWidth={2.5}
                    dot={{ fill: 'var(--cyan)', r: 4 }} activeDot={{ r: 6, fill: 'var(--teal)' }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Bar chart */}
          <div className="chart-card">
            <div className="chart-title">Spend by Category</div>
            {categories.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">📊</div><div className="empty-title">No category data</div></div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={categories}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="category" tick={TICK} />
                  <YAxis tick={TICK} tickFormatter={(v) => `$${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="monthlyTotal" fill="var(--cyan)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top 5 */}
          <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
            <div className="chart-title">Top 5 Most Expensive</div>
            {topSubs.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">🏆</div><div className="empty-title">No active subscriptions yet</div></div>
            ) : (
              topSubs.map((sub, i) => {
                const toMo = (s) => s.billingCycle === 'annually' ? s.cost / 12 : s.billingCycle === 'weekly' ? s.cost * 4.33 : s.cost;
                const monthly = toMo(sub);
                const maxMo   = topSubs[0] ? toMo(topSubs[0]) : 1;
                const pct     = (monthly / maxMo) * 100;
                return (
                  <div key={sub.id} className="top-sub-row">
                    <span className="top-sub-rank">{i + 1}</span>
                    <span className="top-sub-logo">{sub.logo || '📦'}</span>
                    <div className="top-sub-info">
                      <div className="top-sub-name">
                        <span>{sub.name}</span>
                        <span className="top-sub-cost">${monthly.toFixed(2)}/mo</span>
                      </div>
                      <div className="top-sub-bar-track">
                        <div className="top-sub-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
