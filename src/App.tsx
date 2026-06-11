import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import BookingPage from './pages/BookingPage'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAdmin(!!session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (isAdmin === null) return <div>Učitavanje...</div>

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BookingPage />} />
        <Route path="/admin/login" element={
          isAdmin ? <Navigate to="/admin" /> : <AdminLogin />
        } />
        <Route path="/admin" element={
          isAdmin ? <AdminDashboard /> : <Navigate to="/admin/login" />
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App