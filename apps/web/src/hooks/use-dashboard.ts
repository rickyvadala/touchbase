'use client';

import { useQuery } from '@tanstack/react-query';
import type { DashboardRes } from '@touchbase/shared';
import { API_PATHS } from '@touchbase/shared';
import { api } from '../lib/api-client';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get<DashboardRes>(API_PATHS.dashboard),
  });
}
