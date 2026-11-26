import { useEffect, useState } from 'react'
import SearchPage from './Search'
import StayScene from './StayScene'
import {
  Link,
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom'
import { AdminListings } from './Admin'
import Analytics from './Analytics'
import { HostListings, ListingForm } from './Host'
import { ListingPage, BookingsPage } from './Stays'
import { Message } from './Ui'
import { api, clearSession, readSession, saveSession } from './api'

function Layout({ user, onLogout }) {
  return (
    <>
      <header className="topbar">
        <Link className="brand" to="/search">Stay Simple</Link>
        <nav>
          <NavLink to="/search">Search</NavLink>
          {user?.role === 'CUSTOMER' && <NavLink to="/bookings">My bookings</NavLink>}
          {user?.role === 'HOST' && <><NavLink to="/host/listings">My listings</NavLink><NavLink to="/host/analytics">Analytics</NavLink></>}
          {user?.role === 'ADMIN' && <><NavLink to="/admin/listings">Moderation</NavLink><NavLink to="/admin/analytics">Analytics</NavLink></>}
          {user ? <button className="link-button" onClick={onLogout}>Log out</button> : <Link to="/login">Log in</Link>}
        </nav>
      </header>
      <main className="container"><Outlet /></main>
    </>
  )
}

function Protected({ user, roles, children }) {
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/search" replace />
  return children
}

function AuthLayout({ titleId, children }) {
  return <div className="auth-shell">
    <Link className="login-back" to="/search">← Explore stays</Link>
    <div className="login-page">
      <section className="login-panel" aria-labelledby={titleId}>{children}</section>
      <aside className="login-visual" aria-label="A little inspiration for your next stay"><StayScene /></aside>
    </div>
  </div>
}

function Login({ onLogin }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const auth = await api('/auth/login', { method: 'POST', body: JSON.stringify(form) })
      saveSession(auth)
      onLogin(auth.user)
      navigate('/search')
    } catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }
  return <AuthLayout titleId="login-title">
      <p className="eyebrow">A different place. A familiar feeling.</p>
      <h1 id="login-title">Welcome back.</h1>
      <p className="login-intro">Log in to find your next stay and pick up where you left off.</p>
      <form className="login-form" onSubmit={submit}>
        <label htmlFor="login-email">Email address<input id="login-email" type="email" name="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></label>
        <label htmlFor="login-password">Password<input id="login-password" type="password" name="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required /></label>
        <Message error={error} /><button className="primary login-submit" disabled={busy}>{busy ? 'Logging in…' : 'Log in'} <span aria-hidden="true">↗</span></button>
      </form>
      <p className="login-register">New to Stay Simple? <Link to="/register">Create an account ↗</Link></p>
  </AuthLayout>
}

function Register({ onLogin }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'CUSTOMER' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      await api('/auth/register', { method: 'POST', body: JSON.stringify(form) })
      const auth = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email: form.email, password: form.password }) })
      saveSession(auth); onLogin(auth.user); navigate('/search')
    } catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }
  return <AuthLayout titleId="register-title">
    <p className="eyebrow">A different place. A familiar feeling.</p>
    <h1 id="register-title">Create an account.</h1>
    <p className="login-intro">Find your next getaway or welcome guests to a place of your own.</p>
    <form className="login-form" onSubmit={submit}>
      <label htmlFor="register-name">Your name<input id="register-name" name="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></label>
      <label htmlFor="register-email">Email address<input id="register-email" name="email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></label>
      <label htmlFor="register-password">Password<input id="register-password" name="password" type="password" minLength="8" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} aria-describedby="password-hint" required /><small className="auth-field-hint" id="password-hint">At least 8 characters.</small></label>
      <label htmlFor="register-role">I’m here to<select id="register-role" name="role" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}><option value="CUSTOMER">Find and book stays</option><option value="HOST">Host a property</option></select></label>
      <Message error={error} /><button className="primary login-submit" disabled={busy}>{busy ? 'Creating your account…' : 'Create account'} <span aria-hidden="true">↗</span></button>
    </form>
    <p className="login-register">Already have an account? <Link to="/login">Log in ↗</Link></p>
  </AuthLayout>
}

function ReviewPage() { const { id } = useParams(); const navigate = useNavigate(); const [form, setForm] = useState({ rating: 5, comment: '' }); const [error, setError] = useState(''); async function submit(event) { event.preventDefault(); try { await api(`/bookings/${id}/review`, { method: 'POST', body: JSON.stringify(form) }); navigate('/bookings') } catch (err) { setError(err.message) } } return <section className="form-card narrow"><h1>Review your stay</h1><form onSubmit={submit}><label>Rating<select value={form.rating} onChange={e => setForm({ ...form, rating: Number(e.target.value) })}>{[5, 4, 3, 2, 1].map(value => <option key={value} value={value}>{value}</option>)}</select></label><label>Comment<textarea value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} /></label><Message error={error} /><button className="primary">Submit review</button></form></section> }

export default function App() {
  const [user, setUser] = useState(readSession)
  function logout() { clearSession(); setUser(null) }
  return <Routes>
    <Route element={<Layout user={user} onLogout={logout} />}>
      <Route path="/login" element={<Login onLogin={setUser} />} /><Route path="/register" element={<Register onLogin={setUser} />} />
      <Route path="/search" element={<SearchPage />} /><Route path="/listings/:id" element={<ListingPage user={user} />} />
      <Route path="/bookings" element={<Protected user={user} roles={['CUSTOMER']}><BookingsPage /></Protected>} />
      <Route path="/bookings/:id/review" element={<Protected user={user} roles={['CUSTOMER']}><ReviewPage /></Protected>} />
      <Route path="/host/listings" element={<Protected user={user} roles={['HOST']}><HostListings /></Protected>} />
      <Route path="/host/listings/new" element={<Protected user={user} roles={['HOST']}><ListingForm /></Protected>} />
      <Route path="/host/listings/:id/edit" element={<Protected user={user} roles={['HOST']}><ListingForm /></Protected>} />
      <Route path="/host/analytics" element={<Protected user={user} roles={['HOST']}><Analytics /></Protected>} />
      <Route path="/admin" element={<Protected user={user} roles={['ADMIN']}><Outlet /></Protected>}>
        <Route index element={<Navigate to="listings" replace />} />
        <Route path="listings" element={<AdminListings />} />
        <Route path="analytics" element={<Analytics admin />} />
      </Route>
      <Route path="*" element={<Navigate to="/search" replace />} />
    </Route>
  </Routes>
}
