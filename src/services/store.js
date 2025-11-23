let _nextId = 1
const genId = () => String(_nextId++)


const state = {
    rooms: [], // {id, name, capacity}
    reservations: [] // {id, roomId, start: Date, end: Date, people}
}


export const store = {
    get rooms() { return state.rooms },
    get reservations() { return state.reservations },
    addRoom(room) { state.rooms.push({ ...room, id: genId() }); return state.rooms[state.rooms.length - 1] },
    updateRoom(id, patch) {
        const idx = state.rooms.findIndex(r => r.id === id)
        if (idx === -1) throw new Error('Salle introuvable')
        state.rooms[idx] = { ...state.rooms[idx], ...patch }
        return state.rooms[idx]
    },
    deleteRoom(id) {
        const used = state.reservations.some(r => r.roomId === id)
        if (used) throw new Error('Impossible de supprimer: des réservations existent pour cette salle')
        const before = state.rooms.length
        state.rooms = state.rooms.filter(r => r.id !== id)
        state.rooms.length === before // no-op, but keeps intent
    },
    addReservation(res) { state.reservations.push({ ...res, id: genId() }); return state.reservations[state.reservations.length - 1] },
    clearAll() { state.rooms = []; state.reservations = []; _nextId = 1 }
}