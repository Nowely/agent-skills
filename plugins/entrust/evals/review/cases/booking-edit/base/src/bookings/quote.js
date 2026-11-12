export function quoteRoom(room, start, end) {
  return room.setupCents + Math.ceil((end - start) / 2) * room.hourCents;
}
