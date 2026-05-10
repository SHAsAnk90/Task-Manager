import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import {
  getProject, deleteProject,
  getTasksByProject, createTask, updateTask, updateTaskStatus, deleteTask,
  addMember, removeMember
} from '../api/api'

const STATUS_LABELS = { TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' }
const PRIORITY_LABELS = { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High' }

function statusBadge(status) {
  const map = { TODO: 'badge-todo', IN_PROGRESS: 'badge-inprogress', DONE: 'badge-done' }
  return <span className={`badge ${map[status] || ''}`}>{STATUS_LABELS[status] || status}</span>
}
function priorityBadge(priority) {
  const map = { LOW: 'badge-low', MEDIUM: 'badge-medium', HIGH: 'badge-high' }
  return <span className={`badge ${map[priority] || ''}`}>{PRIORITY_LABELS[priority] || priority}</span>
}

const emptyTask = { title: '', description: '', status: 'TODO', priority: 'MEDIUM', dueDate: '', assignedToEmail: '' }

export default function ProjectDetail() {
  const { id }       = useParams()
  const { user }     = useAuth()
  const navigate     = useNavigate()
  const isAdmin      = user?.role === 'ADMIN'

  const [project, setProject]       = useState(null)
  const [tasks, setTasks]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [taskModal, setTaskModal]   = useState(false)
  const [editTask, setEditTask]     = useState(null)
  const [taskForm, setTaskForm]     = useState(emptyTask)
  const [memberEmail, setMemberEmail] = useState('')
  const [error, setError]           = useState('')
  const [taskError, setTaskError]   = useState('')

  const load = () => {
    Promise.all([getProject(id), getTasksByProject(id)])
      .then(([p, t]) => { setProject(p.data); setTasks(t.data) })
      .catch(() => navigate('/projects'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  // ── Task Modal ──────────────────────────────────────────────
  const openCreate = () => { setEditTask(null); setTaskForm(emptyTask); setTaskError(''); setTaskModal(true) }
  const openEdit   = (t) => {
    setEditTask(t)
    setTaskForm({
      title: t.title, description: t.description || '',
      status: t.status, priority: t.priority,
      dueDate: t.dueDate || '', assignedToEmail: t.assignedTo?.email || ''
    })
    setTaskError('')
    setTaskModal(true)
  }

  const handleTaskSubmit = async (e) => {
    e.preventDefault(); setTaskError('')
    const payload = { ...taskForm, assignedToEmail: taskForm.assignedToEmail || null, dueDate: taskForm.dueDate || null }
    try {
      if (editTask) {
        const res = await updateTask(editTask.id, payload)
        setTasks(tasks.map(t => t.id === editTask.id ? res.data : t))
      } else {
        const res = await createTask(id, payload)
        setTasks([...tasks, res.data])
      }
      setTaskModal(false)
    } catch (err) { setTaskError(err.response?.data?.message || 'Failed to save task') }
  }

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return
    try { await deleteTask(taskId); setTasks(tasks.filter(t => t.id !== taskId)) }
    catch (err) { alert(err.response?.data?.message || 'Failed to delete task') }
  }

  const handleStatusChange = async (task, newStatus) => {
    try {
      const res = await updateTaskStatus(task.id, { status: newStatus })
      setTasks(tasks.map(t => t.id === task.id ? res.data : t))
    } catch (err) { alert(err.response?.data?.message || 'Cannot update status') }
  }

  // ── Members ──────────────────────────────────────────────────
  const handleAddMember = async (e) => {
    e.preventDefault(); setError('')
    if (!memberEmail) { setError('Enter an Email ID'); return }
    try {
      const res = await addMember(id, { email: memberEmail })
      setProject(res.data); setMemberEmail('')
    } catch (err) { setError(err.response?.data?.message || 'Failed to add member') }
  }

  const handleRemoveMember = async (userId) => {
    try { const res = await removeMember(id, userId); setProject(res.data) }
    catch (err) { alert(err.response?.data?.message || 'Failed to remove member') }
  }

  const handleDeleteProject = async () => {
    if (!window.confirm('Delete this project and all its tasks?')) return
    try { await deleteProject(id); navigate('/projects') }
    catch (err) { alert(err.response?.data?.message || 'Failed to delete project') }
  }

  if (loading) return <><Navbar /><p className="loading">Loading...</p></>
  if (!project) return null

  return (
    <>
      <Navbar />
      <div className="page">
        {/* Header */}
        <div className="page-header">
          <div>
            <h2>{project.name}</h2>
            {project.description && <p style={{ color: 'var(--muted)', marginTop: '.3rem', fontSize: '.9rem' }}>{project.description}</p>}
          </div>
          <div style={{ display: 'flex', gap: '.75rem' }}>
            {isAdmin && <button className="btn btn-primary" onClick={openCreate}>+ Add Task</button>}
            {isAdmin && <button className="btn btn-danger btn-sm" onClick={handleDeleteProject}>Delete Project</button>}
          </div>
        </div>

        {/* Tasks Table */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <p className="section-title">Tasks ({tasks.length})</p>
          {tasks.length === 0 ? (
            <p className="empty">No tasks yet.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Title</th><th>Status</th><th>Priority</th>
                    <th>Assigned To</th><th>Due Date</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(t => (
                    <tr key={t.id}>
                      <td>
                        <strong>{t.title}</strong>
                        {t.overdue && <span className="badge badge-overdue" style={{ marginLeft: '8px' }}>Overdue</span>}
                        {t.description && <div style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: '.2rem' }}>{t.description}</div>}
                      </td>
                      <td>
                        {isAdmin || t.assignedTo?.id === user.id ? (
                          <select
                            value={t.status}
                            onChange={e => handleStatusChange(t, e.target.value)}
                            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '6px', padding: '4px 6px', fontSize: '.8rem' }}>
                            <option value="TODO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="DONE">Done</option>
                          </select>
                        ) : statusBadge(t.status)}
                      </td>
                      <td>{priorityBadge(t.priority)}</td>
                      <td>{t.assignedTo ? t.assignedTo.name : <span style={{ color: 'var(--muted)' }}>Unassigned</span>}</td>
                      <td>{t.dueDate || <span style={{ color: 'var(--muted)' }}>—</span>}</td>
                      <td>
                        {isAdmin && (
                          <div style={{ display: 'flex', gap: '.5rem' }}>
                            <button className="btn btn-outline btn-sm" onClick={() => openEdit(t)}>Edit</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteTask(t.id)}>Delete</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Members Section */}
        <div className="card">
          <p className="section-title">Members ({project.members.length})</p>
          <div className="members-list" style={{ marginBottom: '1rem' }}>
            {project.members.map(m => (
              <div key={m.id} className="member-chip">
                {m.name}
                {isAdmin && m.id !== project.owner.id && (
                  <button onClick={() => handleRemoveMember(m.id)} title="Remove">×</button>
                )}
              </div>
            ))}
          </div>
          {isAdmin && (
            <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '.75rem', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ margin: 0, flex: 1 }}>
                <label>Add Member by Email</label>
                <input id="member-email" type="email" placeholder="e.g. user@example.com"
                  value={memberEmail} onChange={e => setMemberEmail(e.target.value)} />
              </div>
              <button id="add-member-btn" type="submit" className="btn btn-primary">Add</button>
            </form>
          )}
          {error && <div className="alert alert-error mt-1">{error}</div>}
        </div>
      </div>

      {/* Task Modal */}
      {taskModal && (
        <div className="modal-overlay" onClick={() => setTaskModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editTask ? 'Edit Task' : 'New Task'}</h3>
            {taskError && <div className="alert alert-error">{taskError}</div>}
            <form onSubmit={handleTaskSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input id="task-title" placeholder="Task title" required
                  value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea id="task-desc" placeholder="Optional details"
                  value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} />
              </div>
              <div className="row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Status</label>
                  <select id="task-status" value={taskForm.status} onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}>
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Priority</label>
                  <select id="task-priority" value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>
              <div className="row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Due Date</label>
                  <input id="task-due" type="date" value={taskForm.dueDate}
                    onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Assign to (Email ID)</label>
                  <input id="task-assignee" type="email" placeholder="user@example.com"
                    value={taskForm.assignedToEmail} onChange={e => setTaskForm({ ...taskForm, assignedToEmail: e.target.value })} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setTaskModal(false)}>Cancel</button>
                <button id="save-task-btn" type="submit" className="btn btn-primary">{editTask ? 'Save Changes' : 'Create Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
