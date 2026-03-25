import type { Equipment, Reservation, Room } from '_tosslib/server/types';

type FilterOptions = {
  attendees: number;
  equipment: Equipment[];
  preferredFloor: number | null;
  date: string;
  startTime: string;
  endTime: string;
  reservations: Reservation[];
};

function isRoomAvailable(room: Room, options: FilterOptions): boolean {
  const { attendees, equipment, preferredFloor, date, startTime, endTime, reservations } = options;

  if (room.capacity < attendees) return false;

  if (!equipment.every(eq => room.equipment.includes(eq))) return false;

  if (preferredFloor !== null && room.floor !== preferredFloor) return false;

  const hasConflict = reservations.some(
    r => r.roomId === room.id && r.date === date && r.start < endTime && r.end > startTime
  );
  if (hasConflict) return false;

  return true;
}

export function filterRooms(rooms: Room[], options: FilterOptions): Room[] {
  return rooms
    .filter(room => isRoomAvailable(room, options))
    .sort((a, b) => {
      if (a.floor !== b.floor) return a.floor - b.floor;
      return a.name.localeCompare(b.name);
    });
}
