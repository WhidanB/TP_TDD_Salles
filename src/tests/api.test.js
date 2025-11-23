import { describe, it, expect, beforeEach } from "vitest"
import { api } from "../services/api.js"
import { resetDb } from "./setupFetchMock.js" // installe aussi le fetch mock

function mkUTC(y, m, d, h, mm = 0) {
    return new Date(Date.UTC(y, m - 1, d, h, mm, 0, 0))
}

describe("API salles & réservations (json-server mock)", () => {
    beforeEach(() => {
        resetDb()
    })

    // ---------- Salles ----------
    it("liste et crée des salles", async () => {
        const before = await api.getRooms()
        expect(Array.isArray(before)).toBe(true)
        const created = await api.createRoom({ name: "Zeus", capacity: 12 })
        expect(created.id).toBeTruthy()
        expect(created.name).toBe("Zeus")
        expect(created.capacity).toBe(12)
        const after = await api.getRooms()
        expect(after.length).toBe(before.length + 1)
    })

    it("refuse une salle sans nom ou avec capacité invalide", async () => {
        await expect(api.createRoom({ name: "", capacity: 5 })).rejects.toThrow(/nom/i)
        await expect(api.createRoom({ name: "Gaia", capacity: 0 })).rejects.toThrow(/capacité/i)
    })

    it("met à jour le nom et la capacité d’une salle", async () => {
        const [room] = await api.getRooms()
        const patched = await api.updateRoom(room.id, { name: "Athena+", capacity: room.capacity + 1 })
        expect(patched.name).toBe("Athena+")
        expect(patched.capacity).toBeGreaterThan(room.capacity)
    })

    it("empêche de supprimer une salle qui a des réservations", async () => {
        // Dans le mock de base, la salle id=1 a déjà une réservation (id=1)
        await expect(api.deleteRoom("1")).rejects.toThrow(/réservations existent/i)
    })

    it("supprime une salle sans réservations", async () => {
        const created = await api.createRoom({ name: "Hera", capacity: 5 })
        await expect(api.deleteRoom(created.id)).resolves.not.toThrow()
        const rooms = await api.getRooms()
        expect(rooms.find(r => r.id === created.id)).toBeUndefined()
    })

    // ---------- Réservations ----------
    it("crée une réservation valide", async () => {
        const [room] = await api.getRooms()
        const start = mkUTC(2025, 10, 20, 9, 0)
        const end = mkUTC(2025, 10, 20, 10, 0)
        const resv = await api.createReservation({ roomId: room.id, start, end, people: 3 })
        expect(resv.id).toBeTruthy()
        expect(resv.roomId).toBe(room.id)
    })

    it("refuse une plage invalide (début >= fin)", async () => {
        const [room] = await api.getRooms()
        const start = mkUTC(2025, 10, 20, 10, 0)
        const end = mkUTC(2025, 10, 20, 9, 0)
        await expect(api.createReservation({ roomId: room.id, start, end, people: 2 }))
            .rejects.toThrow(/plage horaire invalide/i)
    })

    it("refuse une réservation si la capacité est dépassée", async () => {
        const [room] = await api.getRooms()
        const start = mkUTC(2025, 10, 21, 9, 0)
        const end = mkUTC(2025, 10, 21, 10, 0)
        await expect(api.createReservation({ roomId: room.id, start, end, people: room.capacity + 1 }))
            .rejects.toThrow(/capacité dépassée/i)
    })

    it("refuse le chevauchement sur la même salle", async () => {
        // Base: réservation existante sur salle 1 : 09:00-10:00 UTC, 2025-10-15
        const start = mkUTC(2025, 10, 15, 9, 30)
        const end = mkUTC(2025, 10, 15, 10, 30)
        await expect(api.createReservation({ roomId: "1", start, end, people: 2 }))
            .rejects.toThrow(/déjà réservée/i)
    })

    it("autorise deux réservations consécutives (bord à bord)", async () => {
        const [room] = await api.getRooms()
        const s1 = mkUTC(2025, 11, 1, 10, 0)
        const e1 = mkUTC(2025, 11, 1, 11, 0)
        const s2 = mkUTC(2025, 11, 1, 11, 0)
        const e2 = mkUTC(2025, 11, 1, 12, 0)
        await api.createReservation({ roomId: room.id, start: s1, end: e1, people: 3 })
        await expect(api.createReservation({ roomId: room.id, start: s2, end: e2, people: 4 }))
            .resolves.not.toThrow()
    })

    it("liste les réservations d’un jour donné (UTC)", async () => {
        // Ajoute deux réservations le même jour
        const [roomA, roomB] = await api.getRooms()
        const day = mkUTC(2025, 12, 2, 0, 0)
        await api.createReservation({ roomId: roomA.id, start: mkUTC(2025, 12, 2, 9, 0), end: mkUTC(2025, 12, 2, 10, 0), people: 2 })
        await api.createReservation({ roomId: roomB.id, start: mkUTC(2025, 12, 2, 14, 0), end: mkUTC(2025, 12, 2, 15, 0), people: 3 })

        const list = await api.getReservationsByDate(day)
        // +0/1 déjà présents le même jour dans la seed selon la date, donc on vérifie >= 2
        expect(list.length).toBeGreaterThanOrEqual(2)
    })

    it("liste les réservations d’une salle", async () => {
        const [room] = await api.getRooms()
        await api.createReservation({ roomId: room.id, start: mkUTC(2025, 12, 3, 9, 0), end: mkUTC(2025, 12, 3, 10, 0), people: 2 })
        await api.createReservation({ roomId: room.id, start: mkUTC(2025, 12, 4, 9, 0), end: mkUTC(2025, 12, 4, 10, 0), people: 2 })
        const byRoom = await api.getReservationsByRoom(room.id)
        expect(byRoom.length).toBeGreaterThanOrEqual(2)
        expect(byRoom.every(r => r.roomId === room.id)).toBe(true)
    })
})
