import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getDashboard } from '../api/api'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard()
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page-header">
          <h2>Dashboard</h2>
          <span style={{ color: 'var(--muted)', fontSize: '.9rem' }}>
            Welcome back, <strong style={{ color: 'var(--text)' }}>{user?.name}</strong>
          </span>
        </div>

        {loading ? (
          <p className="loading">Loading stats...</p>
        ) : stats ? (
          <>
            <div className="stats-grid">
              <div className="stat-card primary">
                <div className="label">Total Tasks</div>
                <div className="value">{stats.totalTasks}</div>
              </div>
              <div className="stat-card">
                <div className="label">To Do</div>
                <div className="value">{stats.todoCount}</div>
              </div>
              <div className="stat-card warn">
                <div className="label">In Progress</div>
                <div className="value">{stats.inProgressCount}</div>
              </div>
              <div className="stat-card success">
                <div className="label">Done</div>
                <div className="value">{stats.doneCount}</div>
              </div>
              <div className="stat-card danger">
                <div className="label">Overdue</div>
                <div className="value">{stats.overdueCount}</div>
              </div>
              <div className="stat-card">
                <div className="label">Projects</div>
                <div className="value">{stats.totalProjects}</div>
              </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <Link to="/projects" className="btn btn-primary">View My Projects →</Link>
            </div>
          </>
        ) : (
          <p className="empty">No data available yet.</p>
        )}
      </div>
    </>
  )
}
