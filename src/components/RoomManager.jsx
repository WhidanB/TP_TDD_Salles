import React from 'react'
import { api } from '../services/api.js'

export function RoomManager({ rooms, reloadRooms, loading }) {
    const [name, setName] = React.useState('')
    const [capacity, setCapacity] = React.useState('')
    const [error, setError] = React.useState('')

    const onAdd = async () => {
        try {
            setError('')
            await api.createRoom({ name, capacity: Number(capacity) })
            setName('')
            setCapacity('')
            await reloadRooms()
        } catch (e) {
            setError(e.message)
        }
    }

    const onInlineEdit = async (id, field, value) => {
        try {
            setError('')
            const patch = field === 'capacity' ? { capacity: Number(value) } : { name: value }
            await api.updateRoom(id, patch)
            await reloadRooms()
        } catch (e) {
            setError(e.message)
        }
    }

    const onDelete = async (id) => {
        try {
            setError('')
            await api.deleteRoom(id)
            await reloadRooms()
        } catch (e) {
            setError(e.message)
        }
    }

    return (
        <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
                <input
                    placeholder="Nom de la salle"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    style={{ flex: 1 }}
                />
                <input
                    placeholder="Capacité"
                    type="number"
                    value={capacity}
                    onChange={e => setCapacity(e.target.value)}
                    style={{ width: 120 }}
                />
                <button onClick={onAdd} disabled={loading}>Ajouter</button>
            </div>
            {error && <p style={{ color: 'crimson' }}>{error}</p>}

            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {rooms.map(r => (
                    <li key={r.id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #eee' }}>
                        <input
                            value={r.name}
                            onChange={e => onInlineEdit(r.id, 'name', e.target.value)}
                            style={{ flex: 1 }}
                        />
                        <input
                            type="number"
                            value={r.capacity}
                            onChange={e => onInlineEdit(r.id, 'capacity', e.target.value)}
                            style={{ width: 120 }}
                        />
                        <button onClick={() => onDelete(r.id)}>Supprimer</button>
                    </li>
                ))}
                {rooms.length === 0 && <li style={{ opacity: 0.7 }}>Aucune salle</li>}
            </ul>
        </div>
    )
}
