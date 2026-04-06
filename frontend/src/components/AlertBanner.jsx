import { Link } from 'react-router-dom';

export default function AlertBanner({ subscriptions }) {
  if (!subscriptions?.length) return null;

  return (
    <div className="alert-banner">
      <div className="alert-banner-icon">⚠️</div>
      <div style={{ flex: 1 }}>
        <div className="alert-title">
          {subscriptions.length === 1
            ? '1 subscription renewing soon!'
            : `${subscriptions.length} subscriptions renewing soon!`}
        </div>
        <div className="alert-items">
          {subscriptions.map((sub) => {
            const days = Math.ceil((new Date(sub.nextBillingDate) - Date.now()) / 86400000);
            return (
              <div key={sub.id} className="alert-item">
                <div className="alert-item-name">
                  <span>{sub.logo || '📦'}</span>
                  <span style={{ fontWeight: 600 }}>{sub.name}</span>
                </div>
                <div className={`alert-item-info ${days === 0 ? 'today' : ''}`}>
                  {days === 0 ? 'Today!' : `in ${days} day${days !== 1 ? 's' : ''}`}
                  {' '}— ${sub.cost.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
        <Link to="/subscriptions" className="alert-link">
          Manage subscriptions →
        </Link>
      </div>
    </div>
  );
}
