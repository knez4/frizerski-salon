import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type{ Appointment, Service } from '../types'

const DAYS = ['Ned', 'Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub']
const MONTHS = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun', 'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar']

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => { 
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: appts } = await supabase
      .from('appointments')
      .select('*, services(*)')
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true })

    const { data: svcs } = await supabase.from('services').select('*')

    setAppointments(appts || [])
    setServices(svcs || [])
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('appointments').update({ status }).eq('id', id)
    fetchData()
  }

  const deleteAppointment = async (id: string) => {
    if (confirm('Obrisati termin?')) {
      await supabase.from('appointments').delete().eq('id', id)
      fetchData()
    }
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const hasAppointments = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return appointments.some(a => a.appointment_date === dateStr)
  }

  const isToday = (day: number) => {
    const today = new Date()
    return day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
  }

  const isSelected = (day: number) => {
    return day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
  }

  const selectDay = (day: number) => {
    setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))
  }

  const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`

  const todayAppointments = appointments.filter(a => a.appointment_date === selectedDateStr)
  const totalToday = appointments.filter(a => a.appointment_date === new Date().toISOString().split('T')[0]).length

  const statusColor = (status: string) => {
    if (status === 'confirmed') return { bg: '#EAF3DE', color: '#3B6D11' }
    if (status === 'cancelled') return { bg: '#fff0f0', color: '#c0392b' }
    return { bg: '#FAEEDA', color: '#854F0B' }
  }

  const statusLabel = (status: string) => {
    if (status === 'confirmed') return 'Potvrđeno'
    if (status === 'cancelled') return 'Otkazano'
    return 'Čeka'
  }

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Učitavanje...</div>

  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f9', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #eee', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
        <div style={{ fontWeight: 500, fontSize: '16px' }}>Frizerski salon — Admin</div>
        <button onClick={handleLogout} style={{ padding: '7px 16px', border: '1px solid #ddd', borderRadius: '8px', background: 'white', cursor: 'pointer', fontSize: '13px', color: '#666' }}>
          Odjavi se
        </button>
      </div>

      <div style={{ padding: '1.5rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '1.5rem' }}>
          {[
            { label: 'Termini danas', val: totalToday },
            { label: 'Ukupno termina', val: appointments.length },
            { label: 'Usluge', val: services.length },
          ].map(s => (
            <div key={s.label} style={{ background: 'white', border: '1px solid #eee', borderRadius: '10px', padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>{s.label}</div>
              <div style={{ fontSize: '24px', fontWeight: 500 }}>{s.val}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '16px' }}>
          {/* Kalendar */}
          <div style={{ background: 'white', border: '1px solid #eee', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', color: '#666' }}>‹</button>
              <div style={{ fontWeight: 500, fontSize: '15px' }}>{MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}</div>
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', color: '#666' }}>›</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
              {DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: '11px', color: '#aaa', padding: '4px 0' }}>{d}</div>)}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
              {Array.from({ length: getFirstDayOfMonth(currentMonth) }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: getDaysInMonth(currentMonth) }).map((_, i) => {
                const day = i + 1
                const selected = isSelected(day)
                const today = isToday(day)
                const hasAppt = hasAppointments(day)
                return (
                  <div key={day} onClick={() => selectDay(day)} style={{
                    aspectRatio: '1',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', cursor: 'pointer', borderRadius: '8px',
                    fontWeight: hasAppt ? 500 : 400,
                    background: selected ? '#185FA5' : hasAppt ? '#E6F1FB' : 'transparent',
                    color: selected ? 'white' : hasAppt ? '#185FA5' : today ? '#185FA5' : '#333',
                    border: today && !selected ? '1.5px solid #185FA5' : '1.5px solid transparent',
                  }}>{day}</div>
                )
              })}
            </div>

            <div style={{ marginTop: '12px', display: 'flex', gap: '12px', fontSize: '11px', color: '#aaa' }}>
              <span><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '3px', background: '#E6F1FB', marginRight: '4px' }}></span>ima termina</span>
              <span><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', border: '1.5px solid #185FA5', marginRight: '4px' }}></span>danas</span>
            </div>
          </div>

          {/* Termini */}
          <div style={{ background: 'white', border: '1px solid #eee', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ fontSize: '12px', color: '#888', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              {selectedDate.getDate()}. {MONTHS[selectedDate.getMonth()]} — termini
            </div>

            {todayAppointments.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#aaa', fontSize: '14px', padding: '2rem 0' }}>
                Nema termina za ovaj dan
              </div>
            ) : (
              todayAppointments.map(appt => {
                const sc = statusColor(appt.status)
                return (
                  <div key={appt.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
                    <div style={{ minWidth: '52px', fontSize: '13px', fontWeight: 500, color: '#333' }}>
                      {appt.appointment_time.slice(0, 5)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>{appt.client_name}</div>
                      <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                        {(appt as any).services?.name} · {appt.client_phone}
                      </div>
                    </div>
                    <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '999px', background: sc.bg, color: sc.color, fontWeight: 500 }}>
                      {statusLabel(appt.status)}
                    </span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {appt.status === 'pending' && (
                        <button onClick={() => updateStatus(appt.id, 'confirmed')}
                          style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #c0dd97', background: '#EAF3DE', color: '#3B6D11', cursor: 'pointer' }}>
                          ✓
                        </button>
                      )}
                      <button onClick={() => deleteAppointment(appt.id)}
                        style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #f7c1c1', background: '#fff0f0', color: '#c0392b', cursor: 'pointer' }}>
                        ✕
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}