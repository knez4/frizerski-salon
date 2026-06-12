import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Service } from '../types'

const MONTHS = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun', 'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar']
const DAYS = ['Ned', 'Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub']

export default function BookingPage() {
  const [step, setStep] = useState(1)
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [takenSlots, setTakenSlots] = useState<string[]>([])
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    supabase.from('services').select('*').eq('is_active', true).then(({ data }) => {
      setServices(data || [])
    })
  }, [])

  useEffect(() => {
    if (!selectedDate) return
    const dateStr = selectedDate.toISOString().split('T')[0]
    supabase.from('appointments')
      .select('appointment_time')
      .eq('appointment_date', dateStr)
      .then(({ data }) => {
        setTakenSlots((data || []).map(a => a.appointment_time.slice(0, 5)))
      })
  }, [selectedDate])

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const getFirstDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()

  const generateTimeSlots = () => {
    const slots = []
    for (let h = 9; h < 18; h++) {
      slots.push(`${String(h).padStart(2, '0')}:00`)
      slots.push(`${String(h).padStart(2, '0')}:30`)
    }
    return slots
  }

  const isPastDate = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const isSunday = (day: number) => {
    return new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).getDay() === 0
  }

  const handleBook = async () => {
    if (!selectedService || !selectedDate || !selectedTime) return
    setLoading(true)

    const { error } = await supabase.from('appointments').insert({
      client_name: clientName,
      client_phone: clientPhone,
      service_id: selectedService.id,
      appointment_date: selectedDate.toISOString().split('T')[0],
      appointment_time: selectedTime,
      status: 'pending'
    })

    setLoading(false)
    if (!error) setDone(true)
  }

  const stepLabel = (n: number) => ['Usluga', 'Datum', 'Vreme', 'Podaci'][n - 1]

  if (done) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f9f9' }}>
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #eee', padding: '2.5rem', textAlign: 'center', maxWidth: '380px', width: '100%' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
        <div style={{ fontSize: '18px', fontWeight: 500, marginBottom: '8px' }}>Termin zakazan!</div>
        <div style={{ fontSize: '14px', color: '#888', marginBottom: '1.5rem' }}>
          {selectedService?.name} · {selectedDate?.getDate()}. {MONTHS[selectedDate?.getMonth() || 0]} · {selectedTime}
        </div>
        <div style={{ fontSize: '13px', color: '#aaa' }}>Bićete kontaktirani kao podsetnik.</div>
        <button onClick={() => { setStep(1); setSelectedService(null); setSelectedDate(null); setSelectedTime(null); setClientName(''); setClientPhone(''); setDone(false) }}
          style={{ marginTop: '1.5rem', padding: '9px 20px', border: '1px solid #ddd', borderRadius: '8px', background: 'white', cursor: 'pointer', fontSize: '14px' }}>
          Zakaži novi termin
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #eee', padding: '2rem', width: '100%', maxWidth: '480px' }}>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '20px', fontWeight: 500 }}>Zakaži termin</div>
          <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>Frizerski salon</div>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
          {[1, 2, 3, 4].map((n, i) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', flex: n < 4 ? 1 : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 500, flexShrink: 0,
                  background: step > n ? '#EAF3DE' : step === n ? '#E6F1FB' : '#f5f5f5',
                  color: step > n ? '#3B6D11' : step === n ? '#185FA5' : '#aaa',
                  border: step === n ? '1.5px solid #378ADD' : '1.5px solid transparent'
                }}>
                  {step > n ? '✓' : n}
                </div>
                <div style={{ fontSize: '12px', color: step === n ? '#333' : '#aaa', fontWeight: step === n ? 500 : 400, whiteSpace: 'nowrap' }}>
                  {stepLabel(n)}
                </div>
              </div>
              {n < 4 && <div style={{ flex: 1, height: '1px', background: '#eee', margin: '0 8px' }} />}
            </div>
          ))}
        </div>

        {/* Step 1 - Usluga */}
        {step === 1 && (
          <div>
            <div style={{ fontSize: '12px', color: '#888', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Izaberi uslugu</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {services.map(s => (
                <div key={s.id} onClick={() => { setSelectedService(s); setStep(2) }}
                  style={{ border: `1px solid ${selectedService?.id === s.id ? '#378ADD' : '#eee'}`, borderRadius: '10px', padding: '14px', cursor: 'pointer', background: selectedService?.id === s.id ? '#E6F1FB' : 'white', transition: 'all 0.12s' }}>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>{s.name}</div>
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '3px' }}>~{s.duration_min} min</div>
                  <div style={{ fontSize: '15px', fontWeight: 500, color: '#185FA5', marginTop: '6px' }}>{s.price.toLocaleString()} din</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 - Datum */}
        {step === 2 && (
          <div>
            <div style={{ fontSize: '12px', color: '#888', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Izaberi datum</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', color: '#666' }}>‹</button>
              <div style={{ fontWeight: 500 }}>{MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}</div>
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', color: '#666' }}>›</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
              {DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: '11px', color: '#aaa' }}>{d}</div>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
              {Array.from({ length: getFirstDay(currentMonth) }).map((_, idx) => <div key={`e-${idx}`} />)}
              {Array.from({ length: getDaysInMonth(currentMonth) }).map((_, i) => {
                const day = i + 1
                const past = isPastDate(day)
                const sunday = isSunday(day)
                const disabled = past || sunday
                const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                const isSelected = selectedDate?.toDateString() === date.toDateString()
                return (
                  <div key={day} onClick={() => { if (!disabled) { setSelectedDate(date); setStep(3) } }}
                    style={{
                      aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', borderRadius: '8px',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      background: isSelected ? '#185FA5' : 'transparent',
                      color: disabled ? '#ccc' : isSelected ? 'white' : '#333',
                      border: '1px solid transparent'
                    }}>{day}</div>
                )
              })}
            </div>
            <div style={{ fontSize: '11px', color: '#aaa', marginTop: '8px' }}>Nedeljom ne radimo.</div>
            <button onClick={() => setStep(1)} style={{ marginTop: '1rem', fontSize: '13px', color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}>← Nazad</button>
          </div>
        )}

        {/* Step 3 - Vreme */}
        {step === 3 && (
          <div>
            <div style={{ fontSize: '12px', color: '#888', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              Izaberi vreme — {selectedDate?.getDate()}. {MONTHS[selectedDate?.getMonth() || 0]}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '1.5rem' }}>
              {generateTimeSlots().map(slot => {
                const taken = takenSlots.includes(slot)
                const selected = selectedTime === slot
                return (
                  <div key={slot} onClick={() => { if (!taken) { setSelectedTime(slot); setStep(4) } }}
                    style={{
                      padding: '8px 0', textAlign: 'center', fontSize: '13px', borderRadius: '8px',
                      border: `1px solid ${selected ? '#378ADD' : taken ? '#eee' : '#ddd'}`,
                      background: selected ? '#E6F1FB' : taken ? '#f9f9f9' : 'white',
                      color: taken ? '#ccc' : selected ? '#185FA5' : '#333',
                      cursor: taken ? 'not-allowed' : 'pointer',
                      textDecoration: taken ? 'line-through' : 'none',
                      fontWeight: selected ? 500 : 400
                    }}>{slot}</div>
                )
              })}
            </div>
            <button onClick={() => setStep(2)} style={{ fontSize: '13px', color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}>← Nazad</button>
          </div>
        )}

        {/* Step 4 - Podaci */}
        {step === 4 && (
          <div>
            <div style={{ background: '#f9f9f9', borderRadius: '8px', padding: '10px 14px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>{selectedService?.name}</div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                  {selectedDate?.getDate()}. {MONTHS[selectedDate?.getMonth() || 0]} · {selectedTime}
                </div>
              </div>
              <div style={{ fontSize: '15px', fontWeight: 500, color: '#185FA5' }}>{selectedService?.price.toLocaleString()} din</div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>Ime i prezime</label>
              <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Marija Nikolić"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>Broj telefona</label>
              <input type="tel" value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="06X XXX XXXX"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>

            <button onClick={handleBook} disabled={loading || !clientName || !clientPhone}
              style={{ width: '100%', padding: '11px', background: (!clientName || !clientPhone || loading) ? '#aaa' : '#185FA5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 500, cursor: (!clientName || !clientPhone || loading) ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Zakazivanje...' : 'Potvrdi termin'}
            </button>

            <button onClick={() => setStep(3)} style={{ marginTop: '12px', fontSize: '13px', color: '#888', background: 'none', border: 'none', cursor: 'pointer', display: 'block' }}>← Nazad</button>
          </div>
        )}
      </div>
    </div>
  )
}