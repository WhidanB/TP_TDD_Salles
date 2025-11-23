const BASE_URL = 'http://localhost:3001'

async function http(path, options = {}) {
    const res = await fetch(`${BASE_URL}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options
    })
    if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`${res.status} ${res.statusText} ${text}`.trim())
    }
    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('application/json')) return res.json()
    return null
}

export const api = {
    // Rooms
    async getRooms() {
        return http('/rooms')
    },
    async createRoom({ name, capacity }) {
        if (!name || !String(name).trim()) throw new Error('Le nom est requis')
        const cap = Number(capacity)
        if (!Number.isFinite(cap) || cap <= 0) throw new Error('La capacité doit être > 0')
        return http('/rooms', { method: 'POST', body: JSON.stringify({ name: String(name).trim(), capacity: cap }) })
    },
    async updateRoom(id, patch) {
        return http(`/rooms/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
    },
    async deleteRoom(id) {
        // Vérif: refuser la suppression s’il existe des réservations associées
        const resByRoom = await this.getReservationsByRoom(id)
        if (resByRoom.length) throw new Error('Impossible de supprimer: des réservations existent pour cette salle')
        return http(`/rooms/${id}`, { method: 'DELETE' })
    },

    // Reservations
    async getAllReservations() {
        return http('/reservations')
    },
    async getReservationsByRoom(roomId) {
        return http(`/reservations?roomId=${encodeURIComponent(roomId)}`)
    },
    async createReservation({ roomId, start, end, people }) {
        // Règles métier côté client avant POST
        if (!(start instanceof Date) || !(end instanceof Date)) throw new Error('Dates invalides')
        if (!(people > 0 && Number.isFinite(people))) throw new Error('Le nombre de personnes doit être > 0')

        const room = await http(`/rooms/${roomId}`)
        if (!room) throw new Error('Salle introuvable')
        if (people > room.capacity) throw new Error('Capacité dépassée pour cette salle')
        if (start >= end) throw new Error('Plage horaire invalide (début < fin requis)')

        const existing = await this.getReservationsByRoom(roomId)
        const s = new Date(start)
        const e = new Date(end)
        const clash = existing.some(r => {
            const rs = new Date(r.start)
            const re = new Date(r.end)
            return s < re && rs < e
        })
        if (clash) throw new Error('La salle est déjà réservée sur cette plage')

        return http('/reservations', {
            method: 'POST',
            body: JSON.stringify({
                roomId,
                start: s.toISOString(),
                end: e.toISOString(),
                people: Number(people)
            })
        })
    },
    async getReservationsByDate(dateUTC) {
        // json-server n’a pas de filtre “same day” natif -> on filtre côté client
        const all = await this.getAllReservations()
        const day = dateUTC.getUTCDate()
        const month = dateUTC.getUTCMonth()
        const year = dateUTC.getUTCFullYear()
        return all.filter(r => {
            const d = new Date(r.start)
            return d.getUTCFullYear() === year && d.getUTCMonth() === month && d.getUTCDate() === day
        })
    }
}
