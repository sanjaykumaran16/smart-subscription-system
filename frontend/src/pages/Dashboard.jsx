import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import apiClient from '../api/client';
import AlertBanner from '../components/AlertBanner';
import SpendingChart from '../components/SpendingChart';

function KpiCard({ label, value, sub, icon, valueClass }) {
  return (
    <div className="kpi-card">
      <div>
        <div className="kpi-label">{label}</div>
        <div className={`kpi-value ${valueClass || ''}`}>{value}</div>
        {sub && <div className="kpi-sub">{sub}</div>}
      </div>
      <div className="kpi-icon">{icon}</div>
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="kpi-card">
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ height: 12, width: 80, marginBottom: 10 }} />
        <div className="skeleton" style={{ height: 32, width: 120, marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 10, width: 60 }} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { subscriptions, fetchSubscriptions } = useStore();
  const user = useStore((s) => s.user);
  const [analytics, setAnalytics] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
    (async () => {
      try {
        const [spendRes, upRes] = await Promise.all([
          apiClient.get('/analytics/spend'),
          apiClient.get('/subscriptions/upcoming?days=7'),
        ]);
        setAnalytics(spendRes.data);
        setUpcoming(upRes.data.subscriptions);
      } catch (_) {}
      finally { setLoadingAnalytics(false); }
    })();
  }, []);

  const active = subscriptions.filter((s) => s.status === 'active');
  const urgent = upcoming.filter((s) => {
    const d = Math.ceil((new Date(s.nextBillingDate) - Date.now()) / 86400000);
    return d <= 3;
  });

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">
          Good day, <span className="gradient-text">{user?.name?.split(' ')[0] || 'there'}</span> 👋
        </h1>
        <p className="page-sub">Here's your subscription overview</p>
      </div>

      {/* Alert */}
      {urgent.length > 0 && <AlertBanner subscriptions={urgent} />}

      {/* KPI Cards */}
      <div className="kpi-grid">
        {loadingAnalytics ? (
          [0,1,2,3].map((i) => <KpiSkeleton key={i} />)
        ) : (
          <>
            <KpiCard label="Monthly Spend" value={`$${analytics?.monthlyTotal?.toFixed(2) ?? '0.00'}`} sub="Active subscriptions" icon="💳" valueClass="cyan" />
            <KpiCard label="Annual Spend" value={`$${analytics?.annualTotal?.toFixed(2) ?? '0.00'}`} sub="Projected this year" icon="📅" valueClass="teal" />
            <KpiCard label="Active Subscriptions" value={active.length} sub={`${subscriptions.length} total`} icon="✅" />
            <KpiCard label="Upcoming Renewals" value={upcoming.length} sub="Next 7 days" icon="🔔" valueClass={upcoming.length > 0 ? 'warn' : ''} />
          </>
        )}
      </div>

      {/* Charts + Recent */}
      <div className="grid-2">
        <SpendingChart />

        {/* Recent */}
        <div className="chart-card">
          <div className="recent-list-header">
            <div className="chart-title" style={{ marginBottom: 0 }}>Recent Subscriptions</div>
            <Link to="/subscriptions" className="see-all">View all →</Link>
          </div>

          {subscriptions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <div className="empty-title">No subscriptions yet</div>
            </div>
          ) : (
            subscriptions.slice(0, 5).map((sub) => (
              <div key={sub.id} className="recent-item">
                <div className="recent-item-left">
                  <span className="recent-item-logo">{sub.logo || '📦'}</span>
                  <div>
                    <div className="recent-item-name">{sub.name}</div>
                    <div className="recent-item-cat">{sub.category}</div>
                  </div>
                </div>
                <div className="recent-item-right">
                  <div className="recent-item-cost">${sub.cost.toFixed(2)}</div>
                  <div className="recent-item-cycle">{sub.billingCycle}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
