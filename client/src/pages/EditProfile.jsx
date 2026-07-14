import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuthStore } from '../stores/useAuthStore.js';
import { useToastStore } from '../stores/useToastStore.js';
import { useUserStore } from '../stores/useUserStore.js';
import Button from '../components/ui/Button.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import { Camera } from 'lucide-react';

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
      const links = existing.externalLinks || existing.links || [];
      links.forEach(l => {
        if (l.platform === 'leetcode') setLeetcode(l.url || '');
        if (l.platform === 'github') setGithub(l.url || '');
        if (l.platform === 'linkedin') setLinkedin(l.url || '');
        if (l.platform === 'website') setWebsite(l.url || '');
      });
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
      console.log('[EDIT] Profile save started. data:', { displayName, hasAvatarFile: !!avatarFile, hasPreview: !!avatarPreview });
      /* If a new avatar was selected, upload it */
      if (avatarFile) {
        const reader = new FileReader();
        data.avatar = await new Promise((resolve) => {
          reader.onload = (ev) => resolve(ev.target.result);
          reader.readAsDataURL(avatarFile);
        });
        console.log('[EDIT] Avatar read as base64, length:', data.avatar?.length);
      }
      /* Save to the store (updates currentProfile in memory for mock mode) */
      const updated = await updateProfile(username, data);
      console.log('[EDIT] Store updateProfile returned:', updated ? { displayName: updated.displayName, avatar: updated.avatar?.slice(0, 60) } : 'undefined');

      /* Sync ALL updated fields to auth store so Navbar and all pages reflect changes immediately */
      const syncUpdates = {};
      syncUpdates.displayName = (updated?.displayName || displayName || '').trim();
      syncUpdates.avatar = updated?.avatar || avatarPreview || '';
      /* Remove data: URLs — only keep real image URLs */
      if (syncUpdates.avatar && syncUpdates.avatar.startsWith('data:')) {
        syncUpdates.avatar = '';
      }
      console.log('[EDIT] Syncing to auth store:', syncUpdates);
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
        <Button type="submit" fullWidth disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
      </form>
    </div>
  );
}
