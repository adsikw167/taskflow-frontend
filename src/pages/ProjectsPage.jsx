import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import styles from './Projects.module.css';

const statusColors = { active: '#2dd4a0', completed: '#4db8ff', archived: '#60607a' };

function CreateProjectModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: '', description: '', dueDate: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/projects', form);
      onCreate(res.data.data);
      toast.success('Project created!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">New Project</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="field">
            <label className="label">Project Name *</label>
            <input className="input-field" placeholder="e.g. Website Redesign" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="field">
            <label className="label">Description</label>
            <textarea className="input-field" placeholder="What's this project about?" rows={3}
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              style={{ resize: 'vertical' }} />
          </div>
          <div className="field">
            <label className="label">Due Date</label>
            <input className="input-field" type="date" value={form.dueDate}
              onChange={e => setForm({ ...form, dueDate: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <div className="spinner" /> : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    api.get('/projects')
      .then(res => setProjects(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  return (
    <div className={`${styles.page} animate-fade`}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Projects</h1>
          <p className={styles.subtitle}>{projects.length} project{projects.length !== 1 ? 's' : ''} in your workspace</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <path d="M8 14a6 6 0 016-6h6l6 6h14a6 6 0 016 6v16a6 6 0 01-6 6H14a6 6 0 01-6-6V14z" stroke="currentColor" strokeWidth="2"/>
            <path d="M24 19v10M19 24h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <h3>No projects yet</h3>
          <p>Create your first project to get started</p>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>Create Project</button>
        </div>
      ) : (
        <div className={styles.grid}>
          {projects.map(project => (
            <Link to={`/projects/${project._id}`} key={project._id} className={styles.projectCard}>
              <div className={styles.cardHeader}>
                <div className={styles.statusDot} style={{ background: statusColors[project.status] }} />
                <span className={styles.statusText}>{project.status}</span>
                <div style={{ flex: 1 }} />
                {project.dueDate && (
                  <span className={styles.dueDate}>
                    Due {format(new Date(project.dueDate), 'MMM d')}
                  </span>
                )}
              </div>
              <h3 className={styles.projectName}>{project.name}</h3>
              {project.description && <p className={styles.projectDesc}>{project.description}</p>}
              <div className={styles.cardFooter}>
                <div className={styles.members}>
                  {project.members.slice(0, 4).map(m => (
                    <div key={m.user._id} className="avatar" style={{ width: 24, height: 24, fontSize: 10, marginLeft: -6, border: '2px solid var(--bg-1)' }}>
                      {m.user.name?.[0]?.toUpperCase()}
                    </div>
                  ))}
                  {project.members.length > 4 && (
                    <div className="avatar" style={{ width: 24, height: 24, fontSize: 10, marginLeft: -6, border: '2px solid var(--bg-1)', background: 'var(--bg-3)', color: 'var(--text-2)' }}>
                      +{project.members.length - 4}
                    </div>
                  )}
                </div>
                <span className={styles.memberCount}>{project.members.length} member{project.members.length !== 1 ? 's' : ''}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onCreate={p => setProjects(prev => [p, ...prev])}
        />
      )}
    </div>
  );
}
