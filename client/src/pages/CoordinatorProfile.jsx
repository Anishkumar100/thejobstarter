import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useUser } from '@clerk/clerk-react';
import { apiRequest } from '../api/client.js';
import Loader from '../components/ui/Loader.jsx';
import {
  Building2, Users, MapPin, Phone, Mail,
  User as UserIcon, Calendar, Shield, Clock, Copy, ExternalLink,
  Pencil, RefreshCw, Check, X
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CARD = {
  border: '3px solid var(--border-color)',
  padding: 'var(--space-md)',
  background: 'var(--bg-surface)',
  boxShadow: '4px 4px 0 var(--shadow-color)'
};

export default function CoordinatorProfile() {
  const { user: clerkUser } = useUser();
  const [center, setCenter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [editingCode, setEditingCode] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [savingCode, setSavingCode] = useState(false);
  const [codeError, setCodeError] = useState('');

  useEffect(() => {
    apiRequest('/coordinator/stats')
      .then(res => {
        if (res.data?.center) setCenter(res.data.center);
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  const copyCode = () => {
    if (center?.code) {
      navigator.clipboard.writeText(center.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const startEditing = () => {
    setNewCode(center?.code || '');
    setCodeError('');
    setEditingCode(true);
  };

  const cancelEditing = () => {
    setEditingCode(false);
    setNewCode('');
    setCodeError('');
  };

  const saveCode = async () => {
    const trimmed = newCode.trim();
    if (!trimmed) {
      setCodeError('Code cannot be empty');
      return;
    }
    if (trimmed === center.code) {
      setEditingCode(false);
      return;
    }
    setSavingCode(true);
    setCodeError('');
    try {
      const res = await apiRequest('/coordinator/center/code', {
        method: 'PATCH',
        body: JSON.stringify({ code: trimmed })
      });
      setCenter(prev => ({ ...prev, code: res.data.code }));
      setEditingCode(false);
    } catch (err) {
      setCodeError(err.message || 'Failed to update code');
    } finally {
      setSavingCode(false);
    }
  };

  const regenerateCode = async () => {
    setSavingCode(true);
    setCodeError('');
    try {
      const res = await apiRequest('/coordinator/center/code', {
        method: 'PATCH',
        body: JSON.stringify({ regenerate: true })
      });
      setCenter(prev => ({ ...prev, code: res.data.code }));
    } catch (err) {
      setCodeError(err.message || 'Failed to regenerate code');
    } finally {
      setSavingCode(false);
    }
  };

  if (loading) return <div style={{ padding: 'var(--space-xl)' }}><Loader text="LOADING PROFILE..." /></div>;
  if (error) return <div style={{ padding: 'var(--space-xl)' }}><div style={{ ...CARD, background: '#fef2f2' }}><strong>Error:</strong> {error}</div></div>;

  const statusColors = {
    active: 'var(--success-bg)',
    trial: 'var(--warning-bg)',
    suspended: 'var(--error-bg)'
  };

  return (
    <div style={{ padding: 'var(--space-lg)', maxWidth: 1200, margin: '0 auto' }}>
      <Helmet><title>Center Profile — Coordinator</title></Helmet>

      {/* ═══ COORDINATOR INFO ═══ */}
      <div style={{ ...CARD, marginBottom: 'var(--space-lg)', padding: 'var(--space-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
          {clerkUser?.imageUrl ? (
            <img src={clerkUser.imageUrl} alt="" style={{ width: 72, height: 72, border: '3px solid #000', objectFit: 'cover', flexShrink: 0 }} />
          ) : (
            <div style={{ width: 72, height: 72, border: '3px solid #000', background: 'var(--bg-inverse)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <UserIcon size={32} />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', fontWeight: 800, marginBottom: 2 }}>
              {clerkUser?.fullName || clerkUser?.username || 'Coordinator'}
            </h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
              <Shield size={14} style={{ color: 'var(--success)' }} />
              <span style={{ fontWeight: 600, color: 'var(--success)' }}>Coordinator</span>
              <span style={{ margin: '0 6px' }}>\u00B7</span>
              <Mail size={12} />
              <span>{clerkUser?.primaryEmailAddress?.emailAddress || 'No email'}</span>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-sm)', flexWrap: 'wrap' }}>
              <Link to="/" className="btn btn--sm" style={{ fontSize: '0.68rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <ExternalLink size={12} /> View Site
              </Link>
              <Link to="/settings/profile" className="btn btn--sm" style={{ fontSize: '0.68rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <UserIcon size={12} /> Edit My Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ CENTER DETAILS ═══ */}
      <div style={{ ...CARD, marginBottom: 'var(--space-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
          {/* Logo - use center.logo if available, otherwise fallback icon */}
          {center?.logo ? (
            <img src={center.logo} alt={`${center.name} logo`} style={{ width: 64, height: 64, border: '3px solid #000', objectFit: 'cover', flexShrink: 0 }} />
          ) : (
            <div style={{ width: 64, height: 64, border: '3px solid #000', background: 'var(--bg-inverse)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Building2 size={28} />
            </div>
          )}
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{center?.name || 'Center Name'}</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4, alignItems: 'center' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '2px 10px', border: '2px solid #000', background: statusColors[center?.status] || 'var(--bg-tertiary)' }}>
                {center?.status || 'Unknown'}
              </span>
              {center?.code && !editingCode && (
                <span style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', border: '2px solid var(--border-color)', background: 'var(--bg-tertiary)', cursor: 'pointer' }} onClick={copyCode}>
                  <Copy size={12} /> Code: <strong style={{ fontFamily: 'monospace', letterSpacing: '0.12em' }}>{center.code}</strong>
                  {copied && <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.65rem' }}>Copied!</span>}
                </span>
              )}
              {!editingCode && center?.code && (
                <span style={{ display: 'inline-flex', gap: 4 }}>
                  <button
                    onClick={startEditing}
                    style={{ fontSize: '0.65rem', padding: '3px 8px', border: '2px solid var(--border-color)', background: 'var(--accent-light)', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3 }}
                    title="Edit code"
                  >
                    <Pencil size={11} /> Edit
                  </button>
                  <button
                    onClick={regenerateCode}
                    disabled={savingCode}
                    style={{ fontSize: '0.65rem', padding: '3px 8px', border: '2px solid var(--border-color)', background: 'var(--bg-tertiary)', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3, opacity: savingCode ? 0.6 : 1 }}
                    title="Generate new random code"
                  >
                    <RefreshCw size={11} style={{ animation: savingCode ? 'spin 0.8s linear infinite' : 'none' }} /> Regenerate
                  </button>
                </span>
              )}
              {/* Inline code editor */}
              {editingCode && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    value={newCode}
                    onChange={e => { setNewCode(e.target.value); setCodeError(''); }}
                    onKeyDown={e => { if (e.key === 'Enter') saveCode(); if (e.key === 'Escape') cancelEditing(); }}
                    style={{
                      fontFamily: 'monospace', fontSize: '0.78rem', letterSpacing: '0.1em',
                      padding: '4px 8px', border: codeError ? '2px solid var(--error)' : '2px solid var(--border-color)',
                      background: 'var(--bg-surface)', color: 'var(--text-primary)',
                      width: 160, outline: 'none'
                    }}
                    placeholder="Enter new code"
                    autoFocus
                  />
                  <button
                    onClick={saveCode}
                    disabled={savingCode}
                    style={{ fontSize: '0.65rem', padding: '4px 10px', border: '2px solid var(--success)', background: 'var(--success-bg)', color: 'var(--success-text)', cursor: 'pointer', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 3, opacity: savingCode ? 0.6 : 1 }}
                  >
                    <Check size={12} /> {savingCode ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={cancelEditing}
                    disabled={savingCode}
                    style={{ fontSize: '0.65rem', padding: '4px 10px', border: '2px solid var(--border-color)', background: 'var(--bg-tertiary)', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3 }}
                  >
                    <X size={12} /> Cancel
                  </button>
                  {codeError && (
                    <span style={{ fontSize: '0.65rem', color: 'var(--error-text)', fontWeight: 600 }}>{codeError}</span>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center details grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-md)' }}>
          {center?.address && (
            <div style={{ padding: 'var(--space-sm)', border: '2px solid #000', background: 'var(--bg-tertiary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)', marginBottom: 4 }}>
                <MapPin size={14} /> Address
              </div>
              <p style={{ fontSize: '0.82rem', fontWeight: 500 }}>{center.address}</p>
            </div>
          )}
          {center?.contactName && (
            <div style={{ padding: 'var(--space-sm)', border: '2px solid #000', background: 'var(--bg-tertiary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)', marginBottom: 4 }}>
                <Users size={14} /> Contact Person
              </div>
              <p style={{ fontSize: '0.82rem', fontWeight: 500 }}>{center.contactName}</p>
            </div>
          )}
          {center?.contactEmail && (
            <div style={{ padding: 'var(--space-sm)', border: '2px solid #000', background: 'var(--bg-tertiary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)', marginBottom: 4 }}>
                <Mail size={14} /> Email
              </div>
              <p style={{ fontSize: '0.82rem', fontWeight: 500 }}>{center.contactEmail}</p>
            </div>
          )}
          {center?.contactPhone && (
            <div style={{ padding: 'var(--space-sm)', border: '2px solid #000', background: 'var(--bg-tertiary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)', marginBottom: 4 }}>
                <Phone size={14} /> Phone
              </div>
              <p style={{ fontSize: '0.82rem', fontWeight: 500 }}>{center.contactPhone}</p>
            </div>
          )}
          {center?.expectedStudents && (
            <div style={{ padding: 'var(--space-sm)', border: '2px solid #000', background: 'var(--bg-tertiary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)', marginBottom: 4 }}>
                <Users size={14} /> Expected Students
              </div>
              <p style={{ fontSize: '0.82rem', fontWeight: 500 }}>{center.expectedStudents}</p>
            </div>
          )}
          <div style={{ padding: 'var(--space-sm)', border: '2px solid #000', background: 'var(--bg-tertiary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)', marginBottom: 4 }}>
              <Calendar size={14} /> Created
            </div>
            <p style={{ fontSize: '0.82rem', fontWeight: 500 }}>{center?.createdAt ? new Date(center.createdAt).toLocaleDateString() : '\u2014'}</p>
          </div>
          <div style={{ padding: 'var(--space-sm)', border: '2px solid #000', background: 'var(--bg-tertiary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)', marginBottom: 4 }}>
              <Clock size={14} /> Last Updated
            </div>
            <p style={{ fontSize: '0.82rem', fontWeight: 500 }}>{center?.updatedAt ? new Date(center.updatedAt).toLocaleDateString() : '\u2014'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
