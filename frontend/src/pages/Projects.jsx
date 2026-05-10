import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getProjects, createProject } from '../api/api'
import { useAuth } from '../context/AuthContext'

export default function Projects() {
  const { user }     = useAuth()
  const navigate     = useNavigate()
  const isAdmin      = user?.role === 'ADMIN'

  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]         = useState({ name: '', description: '' })
  const [error, setError]       = useState('')

  useEffect(() => {
    getProjects()
      .then(res => setProjects(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await createProject(form)
      setProjects([...projects, res.data])
      setShowModal(false)
      setForm({ name: '', description: '' })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project')
    }
  }

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page-header">
          <h2>Projects</h2>
          {isAdmin && (
            <button id="new-project-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
              + New Project
            </button>
          )}
        </div>

        {loading ? (
          <p className="loading">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="empty">No projects yet. {isAdmin ? 'Create your first one!' : 'Ask an Admin to add you.'}</p>
        ) : (
          <div className="projects-grid">
            {projects.map(p => (
              <div key={p.id} className="card project-card" onClick={() => navigate(`/projects/${p.id}`)}>
                <h3>{p.name}</h3>
                <p>{p.description || 'No description'}</p>
                <div className="project-meta">
                  {p.members.length} member{p.members.length !== 1 ? 's' : ''} ·
                  Owner: {p.owner.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>New Project</h3>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Project Name</label>
                <input id="project-name" placeholder="e.g. Website Redesign" required
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Description (optional)</label>
                <textarea id="project-desc" placeholder="What is this project about?"
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button id="create-project-btn" type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
