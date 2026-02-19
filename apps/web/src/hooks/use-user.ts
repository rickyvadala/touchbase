'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UserRes, UpdateUserReq } from '@touchbase/shared';
import { API_PATHS } from '@touchbase/shared';
import { api } from '../lib/api-client';

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => api.get<UserRes>(API_PATHS.me),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserReq) =>
      api.patch<UserRes>(API_PATHS.me, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
