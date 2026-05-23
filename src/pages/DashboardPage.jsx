import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { format, isValid } from 'date-fns';
import styles from './Dashboard.module.css';

const StatCard = ({ label, value, color, icon }) => (
  <div className={`card ${styles.statCard}`} style={{ borderColor: `${color}20` }}>
    <div className={styles.statIcon} style={{ background: `${color}15`, color }}>
      {icon}
    </div>
    <div className={styles.statValue} style={{ color }}>{value}</div>
    <div className={styles.statLabel}>{label}</div>
  </div>
);

const statusColors = { todo: '#60607a', 'in-progress': '#4db8ff', review: '#f5c842', done: '#2dd4a0' };
const statusLabels = { todo: 'To Do', 'in-progress': 'In Progress', review: 'Review', done: 'Done' };
const priorityColors = { low: '#60607a', medium: '#4db8ff', high: '#f5c842', urgent: '#ff5f5f' };

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => setStats(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className={`${styles.dashboard} animate-fade`}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{greeting}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className={styles.subtitle}>Here's your workspace at a glance</p>
        </div>
        <Link to="/projects" className="btn btn-primary">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          New Project
        </Link>
      </div>

      <div className={styles.statsGrid}>
        <StatCard label="Total Projects" value={stats?.totalProjects ?? 0} color="#7c6aff" icon={
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 5a2 2 0 012-2h2l2 2h6a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        }/>
        <StatCard label="Total Tasks" value={stats?.totalTasks ?? 0} color="#4db8ff" icon={
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="2" y="2" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M5 9l2.5 2.5L13 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        }/>
        <StatCard label="Assigned to Me" value={stats?.myTasks ?? 0} color="#2dd4a0" icon={
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M3 15c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        }/>
        <StatCard label="Overdue" value={stats?.overdueTasks ?? 0} color="#ff5f5f" icon={
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M9 5v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        }/>
      </div>

      <div className={styles.mainGrid}>
        {/* Status breakdown */}
        <div className="card">
          <h2 className={styles.sectionTitle}>Tasks by Status</h2>
          <div className={styles.statusList}>
            {Object.entries(stats?.statusCounts || {}).map(([status, count]) => {
              const total = stats?.totalTasks || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={status} className={styles.statusRow}>
                  <div className={styles.statusMeta}>
                    <span className={`badge badge-${status}`}>{statusLabels[status]}</span>
                    <span className={styles.statusCount}>{count}</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${pct}%`, background: statusColors[status] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent tasks */}
        <div className="card">
          <h2 className={styles.sectionTitle}>Recent Tasks</h2>
          {!stats?.recentTasks?.length ? (
            <div className="empty-state" style={{ padding: '32px 0' }}>
              <p>No tasks yet. Create a project to get started.</p>
            </div>
          ) : (
            <div className={styles.taskList}>
              {stats.recentTasks.map(task => (
                <div key={task._id} className={styles.taskRow}>
                  <div className={styles.taskInfo}>
                    <span className={styles.taskTitle}>{task.title}</span>
                    <span className={styles.taskProject}>{task.project?.name}</span>
                  </div>
                  <div className={styles.taskMeta}>
                    <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                    <span className={`badge badge-${task.status}`}>{statusLabels[task.status]}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
