import type { Equipment, Reservation, Room } from '_tosslib/server/types';
import { http } from 'pages/http';

export function getRooms() {
  return http.get<Room[]>('/api/rooms');
}

export function getReservations(date: string) {
  return http.get<Reservation[]>(`/api/reservations?date=${date}`);
}

export function createReservation(data: {
  roomId: string;
  date: string;
  start: string;
  end: string;
  attendees: number;
  equipment: Equipment[];
}) {
  return http.post<typeof data, { ok: boolean; reservation?: unknown; code?: string; message?: string }>(
    '/api/reservations',
    data
  );
}

export function getMyReservations() {
  return http.get<Reservation[]>('/api/my-reservations');
}

export function cancelReservation(id: string) {
  return http.delete<{ ok: boolean }>(`/api/reservations/${id}`);
}
