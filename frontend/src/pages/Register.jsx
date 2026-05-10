import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../api/api'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [form, setForm]     = useState({ name: '', email: '', password: '', role: 'MEMBER' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const { saveAuth }        = useAuth()
  const navigate            = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await register(form)
      saveAuth(res.data.token, res.data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create account</h1>
        <p className="subtitle">Join Team Task Manager today</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input id="name" name="name" type="text" placeholder="John Doe"
              value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input id="reg-email" name="email" type="email" placeholder="you@example.com"
              value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input id="reg-password" name="password" type="password" placeholder="Min 6 characters"
              value={form.password} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select id="role" name="role" value={form.role} onChange={handleChange}>
              <option value="MEMBER">Member — Can view and update task status</option>
              <option value="ADMIN">Admin — Full access to projects and tasks</option>
            </select>
          </div>
          <button id="register-btn" className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
