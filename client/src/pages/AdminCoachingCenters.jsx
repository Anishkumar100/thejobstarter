import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCoachingCenterStore } from '../stores/useCoachingCenterStore.js';
import DataTable from '../components/admin/DataTable.jsx';
import Modal from '../components/ui/Modal.jsx';
import Loader from '../components/ui/Loader.jsx';
import { Building2, Plus, Upload, CheckCircle, Clock, XCircle } from 'lucide-react';
import { uploadMedia } from '../api/mediaApi.js';

export default function AdminCoachingCenters() {
  const { centers, loading, error, fetchCenters, createCenter, deleteCenter } = useCoachingCenterStore();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: '', code: '', logo: '', address: '', expectedStudents: '',
    contactName: '', contactEmail: '', contactPhone: '', status: 'trial'
  });
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => { fetchCenters(); }, []);

  /*
   * Handle form field changes
   */
  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /*
   * Create a new coaching center
   */
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError('Centre name is required');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      await createCenter({
        ...form,
        expectedStudents: form.expectedStudents ? Number(form.expectedStudents) : null
      });
      setShowCreate(false);
      setForm({ name: '', code: '', logo: '', address: '', expectedStudents: '', contactName: '', contactEmail: '', contactPhone: '', status: 'trial' });
    } catch (err) {
      setFormError(err.message || 'Failed to create centre');
    }
    setSaving(false);
  };

  /*
   * Open file picker, upload selected image to ImageKit, set logo URL
   */
  const handleLogoUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploadingLogo(true);
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const res = await uploadMedia(reader.result, `center-logo-${Date.now()}`);
          setForm(prev => ({ ...prev, logo: res.url }));
        } catch (err) {
          console.error('[COACHING] Logo upload failed:', err.message);
        }
        setUploadingLogo(false);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  /*
   * Delete a center with confirmation
   */
  const handleDelete = async (id) => {
    if (!confirm('Delete this coaching centre? This cannot be undone.')) return;
    try {
      await deleteCenter(id);
    } catch (err) {
      alert(err.message || 'Failed to delete centre');
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'code', label: 'Join Code',
      render: v => <code style={{ background: 'var(--gray-100)', padding: '2px 8px', border: '2px solid var(--black)', fontWeight: 700 }}>{v}</code>
    },
    { key: 'status', label: 'Status',
      render: v => {
        const colors = { active: 'var(--success)', trial: 'var(--warning)', suspended: 'var(--error)' };
        return <span style={{ fontWeight: 700, color: colors[v] || 'inherit' }}>{v}</span>;
      }
    },
    { key: 'contactName', label: 'Contact', render: v => v || '—' },
    { key: 'contactEmail', label: 'Email', render: v => v || '—' },
    { key: 'expectedStudents', label: 'Expected', render: v => v != null ? v : '—' },
    { key: 'createdAt', label: 'Created',
      render: v => new Date(v).toLocaleDateString()
    },
    { key: 'actions', label: 'Actions' }
  ];

  const rows = centers.map(c => ({
    ...c,
    actions: (
      <div className="admin-actions" style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        <Link to={`/admin/coaching-centers/${c._id}`} className="btn btn--sm">View</Link>
        <button className="btn btn--sm btn--danger" onClick={() => handleDelete(c._id)}>Delete</button>
      </div>
    )
  }));

  return (
    <div>
      <Helmet><title>Admin Coaching Centres — TheJobStarter</title></Helmet>

      <div className="listing-header">
        <div>
          <h1 className="listing-header__title">Coaching Centres</h1>
          <span className="listing-header__count">{centers.length} centres</span>
        </div>
        <button className="btn btn--primary" onClick={() => setShowCreate(true)}>
          <Plus size={14} style={{ marginRight: 4 }} /> New Centre
        </button>
      </div>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
        {[
          { label: 'Total', value: centers.length, icon: Building2, color: 'var(--black)' },
          { label: 'Active', value: centers.filter(c => c.status === 'active').length, icon: CheckCircle, color: 'var(--success)' },
          { label: 'Trial', value: centers.filter(c => c.status === 'trial').length, icon: Clock, color: 'var(--warning)' },
          { label: 'Suspended', value: centers.filter(c => c.status === 'suspended').length, icon: XCircle, color: 'var(--error)' }
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} style={{
              border: '3px solid var(--black)',
              padding: 'var(--space-md)',
              background: 'var(--bg-surface)',
              boxShadow: '6px 6px 0 var(--black)',
              textAlign: 'center'
            }}>
              <Icon size={24} style={{ color: stat.color, marginBottom: 6 }} />
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)' }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, lineHeight: 1.2 }}>{stat.value}</div>
            </div>
          );
        })}
      </div>

      {loading && <Loader text="LOADING..." />}
      {error && <div className="error-text">{error}</div>}
      {!loading && !error && <DataTable columns={columns} rows={rows} />}

      {/* ── Create Centre Modal ── */}
      <Modal
        isOpen={showCreate}
        onClose={() => { setShowCreate(false); setFormError(''); }}
        className="modal--wide"
        footer={
          <div className="flex gap-2 justify-end">
            <button className="btn" onClick={() => { setShowCreate(false); setFormError(''); }}>Cancel</button>
            <button className="btn btn--primary" onClick={handleCreate} disabled={saving}>
              {saving ? 'Creating...' : 'Create Centre'}
            </button>
          </div>
        }
      >
        {formError && <div className="error-text mb-3">{formError}</div>}

        <form onSubmit={handleCreate}>
          {/* Basic Info */}
          <div className="mb-4 pb-4 border-b-2 border-gray-300 last:border-b-0 last:mb-0 last:pb-0">
            <p className="text-xs font-bold uppercase tracking-widest mb-3 text-gray-500">Basic Information</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className="text-xs font-bold mb-1">Centre Name *</label>
                <input className="input" name="name" placeholder="e.g. Besant Technologies" value={form.name} onChange={handleChange} />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold mb-1">Join Code</label>
                <input className="input" name="code" placeholder="Optional — random if empty" value={form.code} onChange={handleChange} />
                <span className="text-[0.7rem] text-gray-400 mt-0.5">Students enter this to link to your centre</span>
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold mb-1">Status</label>
                <select className="input" name="status" value={form.status} onChange={handleChange}>
                  <option value="trial">Trial</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold mb-1">Expected Students</label>
                <input className="input" name="expectedStudents" type="number" placeholder="Approximate count" value={form.expectedStudents} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="mb-4 pb-4 border-b-2 border-gray-300 last:border-b-0 last:mb-0 last:pb-0">
            <p className="text-xs font-bold uppercase tracking-widest mb-3 text-gray-500">Contact Information</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className="text-xs font-bold mb-1">Contact Person</label>
                <input className="input" name="contactName" placeholder="Full name" value={form.contactName} onChange={handleChange} />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold mb-1">Email</label>
                <input className="input" name="contactEmail" type="email" placeholder="email@example.com" value={form.contactEmail} onChange={handleChange} />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold mb-1">Phone</label>
                <input className="input" name="contactPhone" placeholder="+91 98765 43210" value={form.contactPhone} onChange={handleChange} />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold mb-1">Address</label>
                <textarea className="input" name="address" placeholder="Street, city, pincode" value={form.address} onChange={handleChange} rows={2} />
              </div>
            </div>
          </div>

          {/* Additional */}
          <div className="mb-0 pb-0">
            <p className="text-xs font-bold uppercase tracking-widest mb-3 text-gray-500">Additional</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col sm:col-span-2">
                <label className="text-xs font-bold mb-1">Logo</label>
                <div className="flex gap-2 items-start">
                  <input className="input flex-1" name="logo" placeholder="ImageKit URL or paste link" value={form.logo} onChange={handleChange} />
                  <button type="button" className="btn btn--sm flex items-center gap-1.5 shrink-0" onClick={handleLogoUpload} disabled={uploadingLogo}>
                    <Upload size={14} />
                    {uploadingLogo ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
                {form.logo && (
                  <div className="mt-2 inline-flex" style={{ border: '3px solid #000' }}>
                    <img src={form.logo} alt="Logo preview" className="max-h-20 object-contain" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
