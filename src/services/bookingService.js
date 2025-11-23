import { store } from './store.js'
import { overlaps, isValidRange, sameDay } from '../domain/time.js'


function assert(cond, message) {
    if (!cond) throw new Error(message)
}


export const bookingService = {
    // Rooms
    listRooms() { return [...store.rooms] },
    addRoom({ name, capacity }) {
        assert(name && name.trim().length > 0, 'Le nom est requis')
        const cap = Number(capacity)
        assert(Number.isFinite(cap) && cap > 0, 'La capacité doit être un entier > 0')
        return store.addRoom({ name: name.trim(), capacity: cap })
    },
    updateRoom(id, { name, capacity }) {
        const patch = {}
        if (name !== undefined) {
            assert(name.trim().length > 0, 'Le nom est requis')
            patch.name = name.trim()
        }
        if (capacity !== undefined) {
            const cap = Number(capacity)
            assert(Number.isFinite(cap) && cap > 0, 'La capacité doit être un entier > 0')
            patch.capacity = cap
        }
        return store.updateRoom(id, patch)
    },
    deleteRoom(id) { return store.deleteRoom(id) },


    // Reservations
    listReservations() { return [...store.reservations] },
    listReservationsByRoom(roomId) {
        return store.reservations.filter(r => r.roomId === roomId)
    },
    listReservationsByDate(date) {
        return store.reservations.filter(r => sameDay(r.start, date))
    },
    isRoomAvailable(roomId, start, end, people) {
        const room = store.rooms.find(r => r.id === roomId)
        if (!room) throw new Error('Salle introuvable')
        assert(isValidRange(start, end), 'Plage horaire invalide (début < fin requis)')
        assert(people > 0 && Number.isFinite(people), 'Le nombre de personnes doit être > 0')
        assert(people <= room.capacity, 'Capacité dépassée pour cette salle')


        const conflicts = store.reservations.some(res =>
            res.roomId === roomId && overlaps(start, end, res.start, res.end)
        )
        assert(!conflicts, 'La salle est déjà réservée sur cette plage')
        return true
    },
    createReservation({ roomId, start, end, people }) {
        this.isRoomAvailable(roomId, start, end, people)
        return store.addReservation({ roomId, start, end, people: Number(people) })
    }
}