import React from 'react'
import { api } from '../services/api.js'
import { combineDateTime } from '../domain/time.js'

export function ReservationForm({ rooms, reloadRooms }) {
    const [roomId, setRoomId] = React.useState('')
    const [date, setDate] = React.useState('')
    const [startTime, setStartTime] = React.useState('09:00')
    const [endTime, setEndTime] = React.useState('10:00')
    const [people, setPeople] = React.useState(1)
    const [message, setMessage] = React.useState('')

    // Synchronise la salle sélectionnée lorsque la liste évolue
    React.useEffect(() => {
        if (!roomId && rooms.length > 0) setRoomId(rooms[0].id)
        if (roomId && !rooms.find(r => r.id === roomId)) setRoomId(rooms[0]?.id || '')
    }, [rooms, roomId])

    const submit = async () => {
        try {
            setMessage('')
            if (!roomId) throw new Error('Choisis une salle')
            if (!date) throw new Error('Choisis une date')
            const start = combineDateTime(date, startTime) // -> Date en UTC
            const end = combineDateTime(date, endTime)
            await api.createReservation({ roomId, start, end, people: Number(people) })
            setMessage('✅ Réservation créée !')
            // pas besoin de reloadRooms ici, mais si on veut que le select récupère une salle fraichement ajoutée sur un autre onglet…
            await reloadRooms()
        } catch (e) {
            setMessage('❌ ' + e.message)
        }
    }

    return (
        <div style={{ display: 'grid', gap: 8 }}>
            <label>
                Salle
                <select value={roomId} onChange={e => setRoomId(e.target.value)} style={{ width: '100%' }}>
                    {rooms.length === 0 && <option value="">Aucune salle</option>}
                    {rooms.map(r => (
                        <option key={r.id} value={r.id}>{r.name} (cap. {r.capacity})</option>
                    ))}
                </select>
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <label>
                    Date
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: '100%' }} />
                </label>
                <label>
                    Personnes
                    <input type="number" min={1} value={people} onChange={e => setPeople(e.target.value)} style={{ width: '100%' }} />
                </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <label>
                    Début
                    <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} style={{ width: '100%' }} />
                </label>
                <label>
                    Fin
                    <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} style={{ width: '100%' }} />
                </label>
            </div>

            <button onClick={submit}>Réserver</button>
            {message && <p>{message}</p>}
        </div>
    )
}
