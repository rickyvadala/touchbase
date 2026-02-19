'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  ListInteractionsParams,
  ListInteractionsRes,
  InteractionRes,
  CreateInteractionReq,
} from '@touchbase/shared';
import { API_PATHS } from '@touchbase/shared';
import { api } from '../lib/api-client';

export function useInteractions(params?: ListInteractionsParams) {
  return useQuery({
    queryKey: ['interactions', params],
    queryFn: () =>
      api.get<ListInteractionsRes>(API_PATHS.interactions, params as Record<string, unknown>),
  });
}

export function useCreateInteraction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInteractionReq) =>
      api.post<InteractionRes>(API_PATHS.interactions, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}

export function useDeleteInteraction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.del<void>(API_PATHS.interaction(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions'] });
    },
  });
}
