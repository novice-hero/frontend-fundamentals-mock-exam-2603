import type { Equipment } from '_tosslib/server/types';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EQUIPMENT_LABELS } from 'shared/consts';
import { formatDate } from 'shared/utils';

export function useRoomBookingFilter() {
  const [searchParams, setSearchParams] = useSearchParams();

  const date = searchParams.get('date') || formatDate(new Date());
  const startTime = searchParams.get('startTime') || '';
  const endTime = searchParams.get('endTime') || '';
  const attendees = Number(searchParams.get('attendees')) || 1;
  const equipment = useMemo<Equipment[]>(
    () =>
      searchParams
        .get('equipment')
        ?.split(',')
        .filter((e): e is Equipment => e in EQUIPMENT_LABELS) ?? [],
    [searchParams]
  );
  const preferredFloor = searchParams.get('floor') ? Number(searchParams.get('floor')) : null;

  const setFilter = (key: string, value: string | null) => {
    setSearchParams(
      prev => {
        const next = new URLSearchParams(prev);
        if (value === null || value === '') {
          next.delete(key);
        } else {
          next.set(key, value);
        }
        return next;
      },
      { replace: true }
    );
  };

  return { date, startTime, endTime, attendees, equipment, preferredFloor, setFilter };
}
