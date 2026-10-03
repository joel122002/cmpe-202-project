import { useState } from 'react'
import { api, saveSession } from './api'

export default function App() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [message, setMessage] = useState('')

  async function submit(event) {
    event.preventDefault()
    try {
      const data = await api(mode === 'login' ? '/auth/login' : '/auth/register', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      if (mode === 'login') saveSession(data)
      setMessage(mode === 'login' ? `Welcome, ${data.user.name}.` : 'Account created.')
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <main className="app-shell">
      <section className="panel">
        <p className="eyebrow">Stayfinder</p>
        <h1>{mode === 'login' ? 'Welcome back' : 'Create an account'}</h1>
        <form onSubmit={submit}>
          {mode === 'register' && <input placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />}
          <input type="email" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          <input type="password" placeholder="Password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
          <button type="submit">{mode === 'login' ? 'Sign in' : 'Register'}</button>
        </form>
        <button className="link-button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Need an account?' : 'Already registered?'}
        </button>
        {message && <p role="status">{message}</p>}
      </section>
    </main>
  )
}
