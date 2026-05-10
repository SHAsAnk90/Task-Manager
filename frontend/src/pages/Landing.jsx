import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="landing-brand">TaskManager</div>
        <div className="landing-nav-links">
          {user ? (
            <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">Log In</Link>
              <Link to="/register" className="btn btn-primary">Sign Up Free</Link>
            </>
          )}
        </div>
      </nav>

      <header className="hero">
        <h1>Manage your team's work,<br /><span className="text-gradient">effortlessly.</span></h1>
        <p className="hero-subtitle">
          The all-in-one platform to plan projects, assign tasks, and track progress. 
          Built for modern teams who want to get things done fast.
        </p>
        <div className="hero-cta">
          {user ? (
            <Link to="/dashboard" className="btn btn-primary btn-lg">Open Dashboard</Link>
          ) : (
            <Link to="/register" className="btn btn-primary btn-lg">Start for free</Link>
          )}
        </div>
      </header>

      <section className="features-section">
        <div className="feature-card">
          <div className="feature-icon">🚀</div>
          <h3>Role-Based Access</h3>
          <p>Admins can manage projects and tasks, while Members can focus on updating their progress.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>Real-time Dashboard</h3>
          <p>Track overdue tasks, project status, and overall team productivity at a glance.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🤝</div>
          <h3>Seamless Collaboration</h3>
          <p>Add team members easily and assign tasks to ensure everyone knows what to do.</p>
        </div>
      </section>
    </div>
  );
}
