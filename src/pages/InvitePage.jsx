import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import styles from './Auth.module.css';

export default function InvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, signup, login } = useAuth();
  
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('signup'); // 'signup' or 'login'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Fetch invitation details
    api.get(`/invitations/${token}`)
      .then(res => {
        setInvitation(res.data.data);
        setForm(prev => ({ ...prev, email: res.data.data.email }));
      })
      .catch(err => {
        toast.error(err.response?.data?.message || 'Invalid invitation');
        navigate('/login');
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    // If user is already logged in, accept invitation automatically
    if (user && invitation) {
      acceptInvitation();
    }
  }, [user, invitation]);

  const acceptInvitation = async () => {
    try {
      const res = await api.post(`/invitations/${token}/accept`);
      toast.success('Invitation accepted!');
      navigate(`/projects/${res.data.project._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept invitation');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (mode === 'signup') {
        await signup(form.name, form.email, form.password);
      } else {
        await login(form.email, form.password);
      }
      // After login/signup, useEffect will trigger acceptInvitation
    } catch (err) {
      toast.error(err.response?.data?.message || `${mode === 'signup' ? 'Signup' : 'Login'} failed`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  if (!invitation) return null;

  return (
    <div className={styles.authPage}>
      <div className={`${styles.authCard} animate-fade`}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>🎉 You're Invited!</h1>
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
            <strong>{invitation.inviterName}</strong> invited you to join
          </p>
          <p style={{ color: 'var(--primary)', fontSize: 18, fontWeight: 600, margin: '8px 0' }}>
            {invitation.projectName}
          </p>
          {invitation.projectDescription && (
            <p style={{ color: 'var(--text-3)', fontSize: 13, marginTop: 8 }}>
              {invitation.projectDescription}
            </p>
          )}
        </div>

        <div style={{ background: 'var(--bg-2)', padding: 16, borderRadius: 8, marginBottom: 24 }}>
          <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0 }}>
            Role: <strong style={{ color: 'var(--text-1)' }}>{invitation.role}</strong>
          </p>
        </div>

        <div className={styles.tabs} style={{ marginBottom: 20 }}>
          <button
            className={mode === 'signup' ? styles.activeTab : ''}
            onClick={() => setMode('signup')}
          >
            Create Account
          </button>
          <button
            className={mode === 'login' ? styles.activeTab : ''}
            onClick={() => setMode('login')}
          >
            Login
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mode === 'signup' && (
            <div className="field">
              <label className="label">Name</label>
              <input
                className="input-field"
                placeholder="Your name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
          )}
          
          <div className="field">
            <label className="label">Email</label>
            <input
              className="input-field"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
              disabled
            />
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
              This invitation is for {invitation.email}
            </p>
          </div>

          <div className="field">
            <label className="label">Password</label>
            <input
              className="input-field"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting} style={{ marginTop: 8 }}>
            {submitting ? <div className="spinner" /> : mode === 'signup' ? 'Create Account & Join' : 'Login & Join'}
          </button>
        </form>
      </div>
    </div>
  );
}
