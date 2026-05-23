import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import styles from './Auth.module.css';

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <div className={styles.authLogo}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="10" fill="#7c6aff" opacity="0.15"/>
              <path d="M8 12h16M8 16h12M8 20h8" stroke="#7c6aff" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="24" cy="20" r="3.5" fill="#7c6aff"/>
            </svg>
            <span className={styles.authLogoText}>TaskFlow</span>
          </div>
          <h1 className={styles.authTitle}>Create account</h1>
          <p className={styles.authSubtitle}>Start managing your team's work</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className="field">
            <label className="label">Full Name</label>
            <input
              className="input-field"
              type="text"
              placeholder="John Doe"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label className="label">Email</label>
            <input
              className="input-field"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label className="label">Password</label>
            <input
              className="input-field"
              type="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px' }} disabled={loading}>
            {loading ? <div className="spinner" /> : 'Create Account'}
          </button>
        </form>

        <p className={styles.authSwitch}>
          Already have an account?{' '}
          <Link to="/login" className={styles.authLink}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
