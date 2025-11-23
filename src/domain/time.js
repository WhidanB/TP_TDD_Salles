export function combineDateTime(dateStr, timeStr) {
    const [y, m, d] = dateStr.split('-').map(Number)
    const [hh, mm] = timeStr.split(':').map(Number)
    // On stocke en ISO pour json-server (UTC)
    return new Date(Date.UTC(y, m - 1, d, hh, mm, 0, 0))
}

export function isValidRange(start, end) {
    return start instanceof Date && end instanceof Date && start < end
}

export function overlaps(aStart, aEnd, bStart, bEnd) {
    return aStart < bEnd && bStart < aEnd
}

export function sameDayUTC(dateA, dateB) {
    return (
        dateA.getUTCFullYear() === dateB.getUTCFullYear() &&
        dateA.getUTCMonth() === dateB.getUTCMonth() &&
        dateA.getUTCDate() === dateB.getUTCDate()
    )
}
