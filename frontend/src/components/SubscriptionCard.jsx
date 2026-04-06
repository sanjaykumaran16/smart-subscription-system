import { toast } from 'react-hot-toast';
import { useStore } from '../store/useStore';

const STATUS_CONFIG = {
  active:    { label: 'Active',    cls: 'badge-active' },
  paused:    { label: 'Paused',    cls: 'badge-paused' },
  cancelled: { label: 'Cancelled', cls: 'badge-cancelled' },
};

const CYCLE_LABEL = { monthly: '/mo', annually: '/yr', weekly: '/wk' };

export default function SubscriptionCard({ subscription: sub, onEdit }) {
  const { deleteSubscription } = useStore();

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${sub.name}"? This cannot be undone.`)) return;
    try {
      await deleteSubscription(sub.id);
      toast.success(`"${sub.name}" removed`);
    } catch (_) {
      toast.error('Failed to delete subscription');
    }
  };

  const daysUntil = Math.ceil((new Date(sub.nextBillingDate) - Date.now()) / 86400000);
  const isUrgent  = sub.status === 'active' && daysUntil <= 3 && daysUntil >= 0;
  const cfg       = STATUS_CONFIG[sub.status] || STATUS_CONFIG.active;

  return (
    <div className={`sub-card ${isUrgent ? 'urgent' : ''}`}>
      {/* Top accent stripe */}
      <div className={`sub-card-accent ${isUrgent ? 'warn' : ''}`} />

      {/* Header row */}
      <div className="sub-header">
        <div className="sub-info">
          <div className="sub-logo-wrap">{sub.logo || '📦'}</div>
          <div>
            <div className="sub-name">{sub.name}</div>
            <div className="sub-category">{sub.category}</div>
          </div>
        </div>
        <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
      </div>

      {/* Price */}
      <div className="sub-price">
        <span className="sub-price-amount">${sub.cost.toFixed(2)}</span>
        <span className="sub-price-cycle">{CYCLE_LABEL[sub.billingCycle]}</span>
      </div>

      {/* Meta */}
      <div className="sub-meta">
        <div className="sub-meta-row">
          <span>📅</span>
          <span>Next billing: </span>
          <span className={isUrgent ? 'date-urgent' : ''}>
            {new Date(sub.nextBillingDate).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })}
            {isUrgent && ` (${daysUntil === 0 ? 'Today!' : `${daysUntil}d`})`}
          </span>
        </div>
        {sub.notes && (
          <div className="sub-meta-row" title={sub.notes}>
            <span>📝</span>
            <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {sub.notes}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="sub-actions">
        <button className="btn btn-secondary btn-sm" onClick={() => onEdit(sub)}>
          ✏️ Edit
        </button>
        <button className="btn btn-danger btn-sm btn-icon" onClick={handleDelete} title="Delete">
          🗑️
        </button>
      </div>
    </div>
  );
}
