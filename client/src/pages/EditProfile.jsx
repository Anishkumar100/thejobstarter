import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuthStore } from '../stores/useAuthStore.js';
import { useToastStore } from '../stores/useToastStore.js';
import { useUserStore } from '../stores/useUserStore.js';
import Button from '../components/ui/Button.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import { Camera, CheckCircle, XCircle } from 'lucide-react';
import { apiRequest } from '../api/client.js';

export default function EditProfile() {
  const navigate = useNavigate();
  const authUser = useAuthStore(state => state.user);
  const { currentProfile, fetchProfile: fetchUserByUsername, updateProfile } = useUserStore();

  const username = authUser?.username;

  /* Fetch existing profile data on mount */
  useEffect(() => {
    if (username) fetchUserByUsername(username);
  }, [username]);

  const existing = currentProfile;

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [college, setCollege] = useState('');
  const [year, setYear] = useState('');
  const [leetcode, setLeetcode] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [website, setWebsite] = useState('');
  const [skillsStr, setSkillsStr] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [centerCode, setCenterCode] = useState('');
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [verifiedCenter, setVerifiedCenter] = useState(null);
  const [codeError, setCodeError] = useState('');
  const fileInputRef = useRef(null);

  /* Pre-fill once profile data loads */
  useEffect(() => {
    if (existing) {
      setDisplayName(existing.displayName || '');
      setBio(existing.bio || '');
      setCollege(existing.college || '');
      setYear(existing.year || '');
      setSkillsStr((existing.skills || []).join(', '));
      setAvatarPreview(existing.avatar || null);
      /* Show existing centre link if already connected */
      if (existing.coachingCenter) {
        const centerId = existing.coachingCenter._id || existing.coachingCenter;
        const centerName = existing.coachingCenter.name || 'Linked centre';
        setVerifiedCenter({ _id: centerId, name: centerName });
      }
      const links = existing.externalLinks || existing.links || [];
      links.forEach(l => {
        if (l.platform === 'leetcode') setLeetcode(l.url || '');
        if (l.platform === 'github') setGithub(l.url || '');
        if (l.platform === 'linkedin') setLinkedin(l.url || '');
        if (l.platform === 'website') setWebsite(l.url || '');
      });
      /* Check profile completeness & manage notification */
      apiRequest('/users/check-profile-completeness', { method: 'POST' }).catch(() => {});
    }
  }, [existing]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  /*
   * Verify coaching centre code and link the user
   */
  const handleVerifyCode = async () => {
    if (!centerCode.trim()) return;
    setVerifyingCode(true);
    setCodeError('');
    try {
      const res = await apiRequest('/users/link-coaching-center', {
        method: 'POST',
        body: JSON.stringify({ code: centerCode.trim() })
      });
      setVerifiedCenter({ _id: res.data.coachingCenter, name: centerCode.trim() });
      setCenterCode('');
      useToastStore.getState().success('Linked to centre!');
    } catch (err) {
      setCodeError(err.message || 'Invalid code');
      setVerifiedCenter(null);
    }
    setVerifyingCode(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username) return;
    setSaving(true);
    try {
      const data = {
        displayName,
        bio,
        college,
        year,
        skills: skillsStr.split(',').map(s => s.trim()).filter(Boolean),
        links: { leetcode, github, linkedin, website }
      };
      /* If a new avatar was selected, upload it */
      if (avatarFile) {
        const reader = new FileReader();
        data.avatar = await new Promise((resolve) => {
          reader.onload = (ev) => resolve(ev.target.result);
          reader.readAsDataURL(avatarFile);
        });
      }
      /* Save to the store (updates currentProfile in memory for mock mode) */
      const updated = await updateProfile(username, data);

      /* Sync ALL updated fields to auth store so Navbar and all pages reflect changes immediately */
      const syncUpdates = {};
      syncUpdates.displayName = (updated?.displayName || displayName || '').trim();
      syncUpdates.avatar = updated?.avatar || avatarPreview || '';
      /* Remove data: URLs — only keep real image URLs */
      if (syncUpdates.avatar && syncUpdates.avatar.startsWith('data:')) {
        syncUpdates.avatar = '';
      }
      useAuthStore.getState().updateUser(syncUpdates);
      useToastStore.getState().success('Profile saved!');
      navigate(`/users/${username}`);
    } catch (err) {
      console.error('[EDIT] Error updating profile:', err);
      useToastStore.getState().error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!authUser) {
    return <div className="container container-sm" style={{ paddingTop: 'var(--space-xl)' }}>Loading...</div>;
  }

  return (
    <div className="container container-sm" style={{ paddingTop: 'var(--space-xl)', paddingBottom: 'var(--space-xl)' }}>
      <Helmet>
        <title>Edit Profile — TheJobStarter</title>
      </Helmet>

      <h1 style={{ marginBottom: 'var(--space-lg)' }}>Edit Profile</h1>

      <form onSubmit={handleSubmit}>
        <div className="avatar-picker">
          <div className="avatar-picker__preview">
            <Avatar src={avatarPreview} alt="Avatar" size="lg" />
          </div>
          <button type="button" className="avatar-picker__btn" onClick={() => fileInputRef.current?.click()}>
            <Camera size={18} /> Change Photo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleAvatarChange}
          />
        </div>

        <div className="input-group">
          <label htmlFor="displayName">Display Name</label>
          <input id="displayName" className="input" value={displayName} onChange={e => setDisplayName(e.target.value)} />
        </div>
        <div className="input-group">
          <label htmlFor="bio">Bio</label>
          <textarea id="bio" className="textarea" rows={3} value={bio} onChange={e => setBio(e.target.value)} />
        </div>
        <div className="input-group">
          <label htmlFor="college">College</label>
          <input id="college" className="input" placeholder="e.g. MIT" value={college} onChange={e => setCollege(e.target.value)} />
        </div>
        <div className="input-group">
          <label htmlFor="year">Year</label>
          <input id="year" className="input" placeholder="e.g. 3rd" value={year} onChange={e => setYear(e.target.value)} />
        </div>
        <div className="input-group">
          <label htmlFor="skills">Skills (comma-separated)</label>
          <input id="skills" className="input" placeholder="e.g. DSA, React, Python" value={skillsStr} onChange={e => setSkillsStr(e.target.value)} />
        </div>

        <hr style={{ margin: 'var(--space-lg) 0', border: 'none', borderTop: '3px solid var(--border-color)' }} />
        <p style={{ fontWeight: 700, marginBottom: 'var(--space-md)', fontSize: '0.85rem', textTransform: 'uppercase' }}>External Links</p>

        <div className="input-group">
          <label htmlFor="leetcode">LeetCode URL</label>
          <input id="leetcode" className="input" placeholder="https://leetcode.com/..." value={leetcode} onChange={e => setLeetcode(e.target.value)} />
        </div>
        <div className="input-group">
          <label htmlFor="github">GitHub URL</label>
          <input id="github" className="input" placeholder="https://github.com/..." value={github} onChange={e => setGithub(e.target.value)} />
        </div>
        <div className="input-group">
          <label htmlFor="linkedin">LinkedIn URL</label>
          <input id="linkedin" className="input" placeholder="https://linkedin.com/in/..." value={linkedin} onChange={e => setLinkedin(e.target.value)} />
        </div>
        <div className="input-group">
          <label htmlFor="website">Personal Website</label>
          <input id="website" className="input" placeholder="https://yoursite.com" value={website} onChange={e => setWebsite(e.target.value)} />
        </div>

        <hr style={{ margin: 'var(--space-lg) 0', border: 'none', borderTop: '3px solid var(--border-color)' }} />
        <p style={{ fontWeight: 700, marginBottom: 'var(--space-md)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Coaching Centre</p>

        {verifiedCenter ? (
          /* Already linked to a centre */
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: 'var(--space-sm) var(--space-md)', border: '3px solid var(--black)', background: 'var(--gray-100)' }}>
            <CheckCircle size={18} style={{ color: 'var(--success)', flexShrink: 0 }} />
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{verifiedCenter.name}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Linked to this coaching centre</p>
            </div>
          </div>
        ) : (
          /* Code entry to link */
          <div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <input
                  className="input"
                  placeholder="Enter centre join code"
                  value={centerCode}
                  onChange={e => { setCenterCode(e.target.value); setCodeError(''); setVerifiedCenter(null); }}
                  disabled={verifyingCode}
                />
                {codeError && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--error)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <XCircle size={12} /> {codeError}
                  </p>
                )}
              </div>
              <button type="button" className="btn btn--sm" onClick={handleVerifyCode} disabled={verifyingCode || !centerCode.trim()}>
                {verifyingCode ? 'Verifying...' : 'Verify'}
              </button>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
              Ask your coaching centre for their join code. Leave blank if not applicable.
            </p>
          </div>
        )}

        <Button type="submit" fullWidth disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
      </form>
    </div>
  );
}
