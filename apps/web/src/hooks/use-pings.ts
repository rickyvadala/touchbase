'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  ListPingsParams,
  ListPingsRes,
  PingRes,
  ActOnPingReq,
} from '@touchbase/shared';
import { API_PATHS } from '@touchbase/shared';
import { api } from '../lib/api-client';

export function usePings(params?: ListPingsParams) {
  return useQuery({
    queryKey: ['pings', params],
    queryFn: () =>
      api.get<ListPingsRes>(API_PATHS.pings, params as Record<string, unknown>),
  });
}

export function useTodayPings() {
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const params: ListPingsParams = {
    status: 'pending',
    scheduledBefore: endOfToday.toISOString(),
  };

  return useQuery({
    queryKey: ['pings', 'today'],
    queryFn: () =>
      api.get<ListPingsRes>(API_PATHS.pings, params as Record<string, unknown>),
  });
}

export function useActOnPing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ActOnPingReq }) =>
      api.patch<PingRes>(API_PATHS.ping(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pings'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
