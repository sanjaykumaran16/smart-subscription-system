import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useStore } from '../store/useStore';

const CATEGORIES    = ['streaming', 'software', 'fitness', 'food', 'gaming', 'other'];
const BILLING_CYCLES = ['monthly', 'annually', 'weekly'];
const STATUSES      = ['active', 'paused', 'cancelled'];
const CURRENCIES    = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'];

const DEFAULT_FORM = {
  name: '', category: 'streaming', cost: '', currency: 'USD',
  billingCycle: 'monthly', nextBillingDate: '', status: 'active',
  logo: '', notes: '',
};

const toDateInput = (d) => d ? new Date(d).toISOString().split('T')[0] : '';

export default function AddSubscriptionModal({ onClose, editTarget }) {
  const { addSubscription, updateSubscription } = useStore();
  const [form, setForm]       = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editTarget) {
      setForm({
        name:            editTarget.name            || '',
        category:        editTarget.category        || 'streaming',
        cost:            editTarget.cost?.toString() || '',
        currency:        editTarget.currency        || 'USD',
        billingCycle:    editTarget.billingCycle    || 'monthly',
        nextBillingDate: toDateInput(editTarget.nextBillingDate),
        status:          editTarget.status          || 'active',
        logo:            editTarget.logo            || '',
        notes:           editTarget.notes           || '',
      });
    }
  }, [editTarget]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, cost: parseFloat(form.cost) };
      if (editTarget) {
        await updateSubscription(editTarget.id, payload);
        toast.success(`"${form.name}" updated!`);
      } else {
        await addSubscription(payload);
        toast.success(`"${form.name}" added! 🎉`);
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        {/* Header */}
        <div className="modal-header">
          <span className="modal-title">
            {editTarget ? '✏️ Edit Subscription' : '+ Add Subscription'}
          </span>
          <button type="button" className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            {/* Name + Logo */}
            <div className="form-row form-row-2" style={{ marginBottom: 16 }}>
              <div>
                <label className="field-label">Service Name *</label>
                <input
                  className="field-input" name="name" value={form.name}
                  onChange={handleChange} placeholder="Netflix, Spotify…" required
                />
              </div>
              <div>
                <label className="field-label">Logo / Emoji</label>
                <input
                  className="field-input" name="logo" value={form.logo}
                  onChange={handleChange} placeholder="🎬"
                  style={{ textAlign: 'center', fontSize: 20 }}
                />
              </div>
            </div>

            {/* Category */}
            <div className="field-group">
              <label className="field-label">Category</label>
              <select className="field-input" name="category" value={form.category} onChange={handleChange}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>

            {/* Cost + Currency + Cycle */}
            <div className="form-row" style={{ marginBottom: 16 }}>
              <div>
                <label className="field-label">Cost *</label>
                <input
                  className="field-input" name="cost" type="number"
                  step="0.01" min="0" value={form.cost}
                  onChange={handleChange} placeholder="9.99" required
                />
              </div>
              <div>
                <label className="field-label">Currency</label>
                <select className="field-input" name="currency" value={form.currency} onChange={handleChange}>
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Billing Cycle</label>
                <select className="field-input" name="billingCycle" value={form.billingCycle} onChange={handleChange}>
                  {BILLING_CYCLES.map((b) => <option key={b} value={b}>{b.charAt(0).toUpperCase() + b.slice(1)}</option>)}
                </select>
              </div>
            </div>

            {/* Date + Status */}
            <div className="form-row form-row-2" style={{ marginBottom: 16 }}>
              <div>
                <label className="field-label">Next Billing Date</label>
                <input
                  className="field-input" name="nextBillingDate" type="date"
                  value={form.nextBillingDate} onChange={handleChange}
                />
              </div>
              <div>
                <label className="field-label">Status</label>
                <select className="field-input" name="status" value={form.status} onChange={handleChange}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className="field-group">
              <label className="field-label">Notes (optional)</label>
              <textarea
                className="field-input" name="notes" value={form.notes}
                onChange={handleChange} rows={2}
                placeholder="Any notes about this subscription…"
                style={{ resize: 'none' }}
              />
            </div>

            {/* Actions */}
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading
                  ? <><span className="spinner" />{editTarget ? 'Saving…' : 'Adding…'}</>
                  : editTarget ? 'Save Changes' : 'Add Subscription'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
