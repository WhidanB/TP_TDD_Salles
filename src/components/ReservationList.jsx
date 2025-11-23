import React from 'react'
import { api } from '../services/api.js'

export function ReservationList({ rooms }) {
    const [date, setDate] = React.useState('')
    const [roomId, setRoomId] = React.useState('')
    const [byDate, setByDate] = React.useState([])
    const [byRoom, setByRoom] = React.useState([])

    React.useEffect(() => {
        let ignore = false
        if (!date) { setByDate([]); return }
        ; (async () => {
            const d = new Date(date + 'T00:00:00.000Z')
            const res = await api.getReservationsByDate(d)
            if (!ignore) setByDate(res)
        })()
        return () => { ignore = true }
    }, [date])

    React.useEffect(() => {
        let ignore = false
        if (!roomId) { setByRoom([]); return }
        ; (async () => {
            const res = await api.getReservationsByRoom(roomId)
            if (!ignore) setByRoom(res)
        })()
        return () => { ignore = true }
    }, [roomId])

    const roomName = id => rooms.find(r => r.id === id)?.name || id
    const fmtTime = d => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const fmtDate = d => new Date(d).toLocaleDateString()

    return (
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
            <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                    <label>Réservations pour le jour</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
                    {byDate.map(r => (
                        <li key={r.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 8 }}>
                            <strong>Salle:</strong> {roomName(r.roomId)} — {fmtTime(r.start)} → {fmtTime(r.end)} — <em>{r.people} pers.</em>
                        </li>
                    ))}
                    {date && byDate.length === 0 && <li style={{ opacity: 0.7 }}>Aucune réservation</li>}
                </ul>
            </div>

            <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                    <label>Réservations de la salle</label>
                    <select value={roomId} onChange={e => setRoomId(e.target.value)}>
                        <option value="">Choisir…</option>
                        {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
                    {byRoom.map(r => (
                        <li key={r.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 8 }}>
                            <strong>{fmtDate(r.start)}</strong> — {fmtTime(r.start)} → {fmtTime(r.end)} — <em>{r.people} pers.</em>
                        </li>
                    ))}
                    {roomId && byRoom.length === 0 && <li style={{ opacity: 0.7 }}>Aucune réservation</li>}
                </ul>
            </div>
        </div>
    )
}
