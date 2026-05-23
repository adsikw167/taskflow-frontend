import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format, isPast } from 'date-fns';
import styles from './ProjectDetail.module.css';

const STATUS_ORDER = ['todo', 'in-progress', 'review', 'done'];
const STATUS_LABELS = { todo: 'To Do', 'in-progress': 'In Progress', review: 'Review', done: 'Done' };
const PRIORITY_ORDER = ['low', 'medium', 'high', 'urgent'];

// ─── Task Card ────────────────────────────────────────────────────────────────
function TaskCard({ task, onEdit, onDelete, isAdmin }) {
  const isOverdue = task.dueDate && task.status !== 'done' && isPast(new Date(task.dueDate));

  return (
    <div className={`${styles.taskCard} ${isOverdue ? styles.overdue : ''}`}>
      <div className={styles.taskCardHeader}>
        <span className={`badge badge-${task.priority}`}>{task.priority}</span>
        <div className={styles.taskActions}>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => onEdit(task)}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M8 1.5l2.5 2.5-6 6H2V7.5l6-6z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
            </svg>
          </button>
          {isAdmin && (
            <button className="btn btn-danger btn-icon btn-sm" onClick={() => onDelete(task._id)}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 3h8M5 3V2h2v1M4 3v6h4V3H4z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>
      <h4 className={styles.taskTitle}>{task.title}</h4>
      {task.description && <p className={styles.taskDesc}>{task.description}</p>}
      <div className={styles.taskFooter}>
        {task.assignedTo ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className="avatar" style={{ width: 20, height: 20, fontSize: 9 }}>
              {task.assignedTo.name?.[0]?.toUpperCase()}
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{task.assignedTo.name}</span>
          </div>
        ) : <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Unassigned</span>}
        {task.dueDate && (
          <span style={{ fontSize: 11, color: isOverdue ? 'var(--red)' : 'var(--text-3)' }}>
            {isOverdue ? '⚠ ' : ''}{format(new Date(task.dueDate), 'MMM d')}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Task Modal ───────────────────────────────────────────────────────────────
function TaskModal({ task, members, onClose, onSave, projectId }) {
  const [form, setForm] = useState(
    task || { title: '', description: '', status: 'todo', priority: 'medium', assignedTo: '', dueDate: '', tags: '' }
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        assignedTo: form.assignedTo || null,
      };
      let res;
      if (task) {
        res = await api.put(`/projects/${projectId}/tasks/${task._id}`, payload);
      } else {
        res = await api.post(`/projects/${projectId}/tasks`, payload);
      }
      onSave(res.data.data, !!task);
      toast.success(task ? 'Task updated!' : 'Task created!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <h2 className="modal-title">{task ? 'Edit Task' : 'New Task'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="field">
            <label className="label">Title *</label>
            <input className="input-field" placeholder="Task title" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="field">
            <label className="label">Description</label>
            <textarea className="input-field" placeholder="Details..." rows={3} value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field">
              <label className="label">Status</label>
              <select className="input-field" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                {STATUS_ORDER.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="label">Priority</label>
              <select className="input-field" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                {PRIORITY_ORDER.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field">
              <label className="label">Assign To</label>
              <select className="input-field" value={form.assignedTo || ''} onChange={e => setForm({ ...form, assignedTo: e.target.value })}>
                <option value="">Unassigned</option>
                {members.map(m => <option key={m.user._id} value={m.user._id}>{m.user.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="label">Due Date</label>
              <input className="input-field" type="date" value={form.dueDate ? form.dueDate.slice(0, 10) : ''}
                onChange={e => setForm({ ...form, dueDate: e.target.value })} />
            </div>
          </div>
          <div className="field">
            <label className="label">Tags (comma separated)</label>
            <input className="input-field" placeholder="frontend, bug, urgent"
              value={Array.isArray(form.tags) ? form.tags.join(', ') : form.tags}
              onChange={e => setForm({ ...form, tags: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <div className="spinner" /> : task ? 'Update' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Add Member Modal ─────────────────────────────────────────────────────────
function AddMemberModal({ projectId, onClose, onAdd }) {
  const [form, setForm] = useState({ email: '', role: 'member' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post(`/projects/${projectId}/members`, form);
      onAdd(res.data.data);
      toast.success('Member added!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Add Member</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="field">
            <label className="label">Email Address</label>
            <input className="input-field" type="email" placeholder="team@example.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="field">
            <label className="label">Role</label>
            <select className="input-field" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <div className="spinner" /> : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('board');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');

  const isAdmin = project?.members?.find(m => m.user._id === user?._id)?.role === 'admin';

  useEffect(() => {
    Promise.all([
      api.get(`/projects/${projectId}`),
      api.get(`/projects/${projectId}/tasks`),
    ])
      .then(([pRes, tRes]) => {
        setProject(pRes.data.data);
        setTasks(tRes.data.data);
      })
      .catch(() => { toast.error('Failed to load project'); navigate('/projects'); })
      .finally(() => setLoading(false));
  }, [projectId]);

  const handleSaveTask = (savedTask, isEdit) => {
    setTasks(prev =>
      isEdit ? prev.map(t => t._id === savedTask._id ? savedTask : t) : [savedTask, ...prev]
    );
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/projects/${projectId}/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t._id !== taskId));
      toast.success('Task deleted');
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Remove this member?')) return;
    try {
      const res = await api.delete(`/projects/${projectId}/members/${memberId}`);
      setProject(res.data.data);
      toast.success('Member removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm('Delete this entire project and all its tasks? This cannot be undone.')) return;
    try {
      await api.delete(`/projects/${projectId}`);
      toast.success('Project deleted');
      navigate('/projects');
    } catch (err) {
      toast.error('Failed to delete project');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  const filteredTasks = filterStatus ? tasks.filter(t => t.status === filterStatus) : tasks;
  const tasksByStatus = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = filteredTasks.filter(t => t.status === s);
    return acc;
  }, {});

  return (
    <div className={`${styles.page} animate-fade`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.breadcrumb}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/projects')}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Projects
          </button>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.projectName}>{project?.name}</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {isAdmin && (
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddMember(true)}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="6" cy="4" r="3" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M1 12c0-2.761 2.239-5 5-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  <path d="M11 9v4M9 11h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                Add Member
              </button>
              <button className="btn btn-danger btn-sm" onClick={handleDeleteProject}>Delete Project</button>
            </>
          )}
          <button className="btn btn-primary btn-sm" onClick={() => { setEditingTask(null); setShowTaskModal(true); }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            Add Task
          </button>
        </div>
      </div>

      {project?.description && <p className={styles.desc}>{project.description}</p>}

      {/* Tabs */}
      <div className={styles.tabs}>
        {['board', 'list', 'members'].map(tab => (
          <button key={tab} className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <select className="input-field" style={{ width: 'auto', padding: '5px 10px', fontSize: 12 }}
          value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          {STATUS_ORDER.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      {/* Board View */}
      {activeTab === 'board' && (
        <div className={styles.board}>
          {STATUS_ORDER.map(status => (
            <div key={status} className={styles.column}>
              <div className={styles.columnHeader}>
                <span className={`badge badge-${status}`}>{STATUS_LABELS[status]}</span>
                <span className={styles.columnCount}>{tasksByStatus[status].length}</span>
              </div>
              <div className={styles.columnBody}>
                {tasksByStatus[status].length === 0 ? (
                  <div className={styles.emptyCol}>No tasks</div>
                ) : tasksByStatus[status].map(task => (
                  <TaskCard key={task._id} task={task} onEdit={handleEditTask} onDelete={handleDeleteTask} isAdmin={isAdmin} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {activeTab === 'list' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {filteredTasks.length === 0 ? (
            <div className="empty-state"><p>No tasks found</p></div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Assigned To</th>
                  <th>Due Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map(task => {
                  const isOverdue = task.dueDate && task.status !== 'done' && isPast(new Date(task.dueDate));
                  return (
                    <tr key={task._id}>
                      <td>
                        <div>
                          <div className={styles.tableTaskTitle}>{task.title}</div>
                          {task.description && <div className={styles.tableTaskDesc}>{task.description}</div>}
                        </div>
                      </td>
                      <td><span className={`badge badge-${task.status}`}>{STATUS_LABELS[task.status]}</span></td>
                      <td><span className={`badge badge-${task.priority}`}>{task.priority}</span></td>
                      <td>
                        {task.assignedTo ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div className="avatar" style={{ width: 22, height: 22, fontSize: 10 }}>
                              {task.assignedTo.name?.[0]?.toUpperCase()}
                            </div>
                            <span style={{ fontSize: 13 }}>{task.assignedTo.name}</span>
                          </div>
                        ) : <span style={{ color: 'var(--text-3)', fontSize: 13 }}>—</span>}
                      </td>
                      <td style={{ color: isOverdue ? 'var(--red)' : 'var(--text-2)', fontSize: 13 }}>
                        {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : '—'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleEditTask(task)}>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M8 1.5l2.5 2.5-6 6H2V7.5l6-6z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          {isAdmin && (
                            <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDeleteTask(task._id)}>
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M2 3h8M5 3V2h2v1M4 3v6h4V3H4z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Members View */}
      {activeTab === 'members' && (
        <div className="card" style={{ maxWidth: 600 }}>
          <h3 style={{ marginBottom: 16, fontSize: 15 }}>Team Members ({project?.members?.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {project?.members?.map(m => (
              <div key={m.user._id} className={styles.memberRow}>
                <div className="avatar">{m.user.name?.[0]?.toUpperCase()}</div>
                <div className={styles.memberInfo}>
                  <span className={styles.memberName}>{m.user.name}</span>
                  <span className={styles.memberEmail}>{m.user.email}</span>
                </div>
                <span className={`badge ${m.role === 'admin' ? 'badge-review' : 'badge-todo'}`}>{m.role}</span>
                {isAdmin && m.user._id !== user?._id && (
                  <button className="btn btn-danger btn-sm" onClick={() => handleRemoveMember(m.user._id)}>Remove</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showTaskModal && (
        <TaskModal
          task={editingTask}
          members={project?.members || []}
          projectId={projectId}
          onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
          onSave={handleSaveTask}
        />
      )}
      {showAddMember && (
        <AddMemberModal
          projectId={projectId}
          onClose={() => setShowAddMember(false)}
          onAdd={updated => setProject(updated)}
        />
      )}
    </div>
  );
}
