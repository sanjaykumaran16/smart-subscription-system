import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import SubscriptionCard from '../components/SubscriptionCard';
import AddSubscriptionModal from '../components/AddSubscriptionModal';

const CATEGORIES = ['all', 'streaming', 'software', 'fitness', 'food', 'gaming', 'other'];
const STATUSES   = ['all', 'active', 'paused', 'cancelled'];

export default function Subscriptions() {
  const { subscriptions, fetchSubscriptions, loading } = useStore();
  const [category, setCategory] = useState('all');
  const [status, setStatus]     = useState('all');
  const [search, setSearch]     = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  useEffect(() => {
    fetchSubscriptions({
      category: category !== 'all' ? category : undefined,
      status:   status   !== 'all' ? status   : undefined,
    });
  }, [category, status]);

  const filtered = subscriptions.filter((s) => {
    const matchCat    = category === 'all' || s.category === category;
    const matchStatus = status   === 'all' || s.status   === status;
    const matchSearch = !search  || s.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchStatus && matchSearch;
  });

  const handleEdit  = (sub) => { setEditTarget(sub); setShowModal(true); };
  const handleClose = () => { setShowModal(false); setEditTarget(null); };

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="toolbar">
        <div>
          <h1 className="page-title">Subscriptions</h1>
          <p className="page-sub">{subscriptions.length} total</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Subscription
        </button>
      </div>

      {/* Search */}
      <div className="input-wrapper mb-16">
        <span className="input-icon">🔍</span>
        <input
          className="field-input"
          type="text" placeholder="Search subscriptions…"
          value={search} onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="filter-row">
        <div className="filter-group">
          <div className="filter-label">Category</div>
          <div className="filter-chips">
            {CATEGORIES.map((c) => (
              <button
                key={c} className={`chip ${category === c ? 'active' : ''}`}
                onClick={() => setCategory(c)}
              >{c}</button>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <div className="filter-label">Status</div>
          <div className="filter-chips">
            {STATUSES.map((s) => (
              <button
                key={s} className={`chip ${status === s ? 'active' : ''}`}
                onClick={() => setStatus(s)}
              >{s}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="sub-grid">
          {[0,1,2,3,4,5].map((i) => (
            <div key={i} className="sub-card">
              <div className="skeleton" style={{ height:48, width:48, borderRadius:12 }} />
              <div className="skeleton" style={{ height:16, width:'60%', margin:'12px 0 8px' }} />
              <div className="skeleton" style={{ height:12, width:'40%' }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <div className="empty-title">No subscriptions found</div>
          <div className="empty-sub">Try changing filters or add a new subscription</div>
        </div>
      ) : (
        <div className="sub-grid">
          {filtered.map((sub) => (
            <SubscriptionCard key={sub.id} subscription={sub} onEdit={handleEdit} />
          ))}
        </div>
      )}

      {showModal && <AddSubscriptionModal onClose={handleClose} editTarget={editTarget} />}
    </div>
  );
}
