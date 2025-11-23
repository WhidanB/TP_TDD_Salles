import React from 'react'
import { api } from './services/api.js'
import { RoomManager } from './components/RoomManager.jsx'
import { ReservationForm } from './components/ReservationForm.jsx'
import { ReservationList } from './components/ReservationList.jsx'

export default function App() {
  const [rooms, setRooms] = React.useState([])
  const [loadingRooms, setLoadingRooms] = React.useState(false)
  const [error, setError] = React.useState('')

  const reloadRooms = React.useCallback(async () => {
    try {
      setError('')
      setLoadingRooms(true)
      const data = await api.getRooms()
      setRooms(data)
    } catch (e) {
      setError(e.message || 'Erreur de chargement des salles')
    } finally {
      setLoadingRooms(false)
    }
  }, [])

  React.useEffect(() => {
    reloadRooms()
  }, [reloadRooms])

  return (
    <div style={{ padding: 16, fontFamily: 'system-ui, sans-serif', maxWidth: 1100, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1>Réservation de Salles</h1>

      </header>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr', marginTop: 16 }}>
        <section style={{ border: '1px solid #ccc', borderRadius: 12, padding: 12 }}>
          <h2>Gérer les salles</h2>
          <RoomManager
            rooms={rooms}
            reloadRooms={reloadRooms}
            loading={loadingRooms}
          />
        </section>

        <section style={{ border: '1px solid #ccc', borderRadius: 12, padding: 12 }}>
          <h2>Nouvelle réservation</h2>
          <ReservationForm
            rooms={rooms}
            reloadRooms={reloadRooms}
          />
        </section>
      </div>

      <section style={{ border: '1px solid #ccc', borderRadius: 12, padding: 12, marginTop: 16 }}>
        <h2>Afficher les réservations</h2>
        <ReservationList rooms={rooms} />
      </section>
    </div>
  )
}
