// On simule les endpoints /rooms et /reservations avec GET/POST/PATCH/DELETE.

const initialDb = () => ({
    rooms: [
        { id: "1", name: "Athena", capacity: 6 },
        { id: "2", name: "Hermes", capacity: 10 }
    ],
    reservations: [
        {
            id: "1",
            roomId: "1",
            start: "2025-10-15T09:00:00.000Z",
            end: "2025-10-15T10:00:00.000Z",
            people: 4
        }
    ]
})

let db = initialDb()
let nextId = 100 // pour générer des id stables pendant les tests

export function resetDb() {
    db = initialDb()
    nextId = 100
}

function jsonResponse(body, init = 200) {
    const status = typeof init === "number" ? init : init.status || 200
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
        ...(typeof init === "object" ? init : {})
    })
}

function noContent(status = 204) {
    return new Response(null, { status })
}

function notFound() {
    return new Response("Not Found", { status: 404 })
}

function badRequest(message = "Bad Request") {
    return new Response(message, { status: 400 })
}

function parseUrl(urlStr) {
    try {
        return new URL(urlStr, "http://localhost:3001")
    } catch {
        return new URL("http://localhost:3001")
    }
}

async function handleRooms(url, init) {
    const method = (init?.method || "GET").toUpperCase()
    const parts = url.pathname.split("/").filter(Boolean) // ["rooms"] ou ["rooms","123"]

    // /rooms
    if (parts.length === 1) {
        if (method === "GET") return jsonResponse(db.rooms)
        if (method === "POST") {
            const body = JSON.parse(init?.body || "{}")
            if (!body.name || !Number.isFinite(body.capacity) || body.capacity <= 0) {
                return badRequest("Nom/capacité invalides")
            }
            const created = { id: String(nextId++), name: String(body.name).trim(), capacity: Number(body.capacity) }
            db.rooms.push(created)
            return jsonResponse(created, 201)
        }
        return badRequest()
    }

    // /rooms/:id
    if (parts.length === 2) {
        const id = parts[1]
        const room = db.rooms.find(r => r.id === id)
        if (!room) return notFound()

        if (method === "GET") return jsonResponse(room)
        if (method === "PATCH") {
            const patch = JSON.parse(init?.body || "{}")
            Object.assign(room, patch)
            return jsonResponse(room)
        }
        if (method === "DELETE") {
            db.rooms = db.rooms.filter(r => r.id !== id)
            return noContent()
        }
    }

    return notFound()
}

async function handleReservations(url, init) {
    const method = (init?.method || "GET").toUpperCase()
    const parts = url.pathname.split("/").filter(Boolean) // ["reservations"] ou ["reservations","123"]

    // /reservations
    if (parts.length === 1) {
        if (method === "GET") {
            const roomId = url.searchParams.get("roomId")
            if (roomId) {
                return jsonResponse(db.reservations.filter(r => r.roomId === roomId))
            }
            return jsonResponse(db.reservations)
        }

        if (method === "POST") {
            const body = JSON.parse(init?.body || "{}")
            const created = {
                id: String(nextId++),
                roomId: body.roomId,
                start: body.start,
                end: body.end,
                people: Number(body.people)
            }
            db.reservations.push(created)
            return jsonResponse(created, 201)
        }

        return badRequest()
    }

    // /reservations/:id 
    if (parts.length === 2) {
        const id = parts[1]
        const resv = db.reservations.find(r => r.id === id)
        if (!resv) return notFound()

        if (method === "GET") return jsonResponse(resv)
        if (method === "DELETE") {
            db.reservations = db.reservations.filter(r => r.id !== id)
            return noContent()
        }
    }

    return notFound()
}

export function installFetchMock() {
    globalThis.fetch = async (input, init) => {
        const url = parseUrl(typeof input === "string" ? input : input.url)

        // On route selon le path
        if (url.pathname.startsWith("/rooms")) {
            return handleRooms(url, init)
        }
        if (url.pathname.startsWith("/reservations")) {
            return handleReservations(url, init)
        }

        return notFound()
    }
}

installFetchMock()
