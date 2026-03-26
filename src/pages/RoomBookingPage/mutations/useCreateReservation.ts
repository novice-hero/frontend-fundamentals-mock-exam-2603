import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Equipment } from '_tosslib/server/types';
import { createReservation } from 'pages/remotes';

export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      roomId: string;
      date: string;
      start: string;
      end: string;
      attendees: number;
      equipment: Equipment[];
    }) => createReservation(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reservations', variables.date] });
      queryClient.invalidateQueries({ queryKey: ['myReservations'] });
    },
  });
}
