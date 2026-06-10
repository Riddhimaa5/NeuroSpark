import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('neurospark_user')
    if (saved) setUser(JSON.parse(saved))
    setLoading(false)
  }, [])

  const signup = (name, email, password, phone) => {
    const users = JSON.parse(localStorage.getItem('neurospark_users') || '[]')
    const exists = users.find(u => u.email === email)
    if (exists) return { error: 'An account with this email already exists' }
    const newUser = {
      id: Date.now().toString(),
      name, email, password, phone,
      createdAt: new Date().toISOString(),
      children: [],
      sessions: []
    }
    users.push(newUser)
    localStorage.setItem('neurospark_users', JSON.stringify(users))
    localStorage.setItem('neurospark_user', JSON.stringify(newUser))
    setUser(newUser)
    return { success: true }
  }

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem('neurospark_users') || '[]')
    const found = users.find(u => u.email === email && u.password === password)
    if (!found) return { error: 'Invalid email or password' }
    localStorage.setItem('neurospark_user', JSON.stringify(found))
    setUser(found)
    return { success: true }
  }

  const logout = () => {
    localStorage.removeItem('neurospark_user')
    setUser(null)
  }

  const saveSession = (childData, scores, taskResults) => {
    const users = JSON.parse(localStorage.getItem('neurospark_users') || '[]')
    const idx = users.findIndex(u => u.id === user.id)
    if (idx === -1) return
    const session = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      child: childData,
      scores,
      taskResults
    }
    if (!users[idx].sessions) users[idx].sessions = []
    users[idx].sessions.push(session)
    localStorage.setItem('neurospark_users', JSON.stringify(users))
    const updated = users[idx]
    localStorage.setItem('neurospark_user', JSON.stringify(updated))
    setUser(updated)
    return session
  }

  const getSessions = (childName) => {
    if (!user?.sessions) return []
    return user.sessions
      .filter(s => s.child?.name?.toLowerCase() === childName?.toLowerCase())
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, saveSession, getSessions }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}