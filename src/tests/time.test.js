import { describe, it, expect } from "vitest"
import { combineDateTime, isValidRange, overlaps } from "../domain/time.js"

describe("Helpers temporels", () => {
    it("combineDateTime crée une Date UTC correcte", () => {
        const d = combineDateTime("2025-10-09", "14:30")
        expect(d.getUTCFullYear()).toBe(2025)
        expect(d.getUTCMonth()).toBe(9) // Octobre (0-based)
        expect(d.getUTCDate()).toBe(9)
        expect(d.getUTCHours()).toBe(14)
        expect(d.getUTCMinutes()).toBe(30)
    })

    it("isValidRange détecte les plages invalides", () => {
        const s = new Date(Date.UTC(2025, 0, 1, 10, 0))
        const e = new Date(Date.UTC(2025, 0, 1, 9, 0))
        expect(isValidRange(s, e)).toBe(false)
        expect(isValidRange(e, s)).toBe(true)
    })

    it("overlaps gère les cas bord", () => {
        const a1 = new Date(Date.UTC(2025, 0, 1, 9))
        const a2 = new Date(Date.UTC(2025, 0, 1, 10))
        const b1 = new Date(Date.UTC(2025, 0, 1, 10))
        const b2 = new Date(Date.UTC(2025, 0, 1, 11))
        expect(overlaps(a1, a2, b1, b2)).toBe(false) // b1 == a2 => pas de chevauchement

        const c1 = new Date(Date.UTC(2025, 0, 1, 9))
        const c2 = new Date(Date.UTC(2025, 0, 1, 11))
        const d1 = new Date(Date.UTC(2025, 0, 1, 10))
        const d2 = new Date(Date.UTC(2025, 0, 1, 12))
        expect(overlaps(c1, c2, d1, d2)).toBe(true)
    })
})
