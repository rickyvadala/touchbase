'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  ListContactsParams,
  ListContactsRes,
  ContactRes,
  CreateContactReq,
  UpdateContactReq,
} from '@touchbase/shared';
import { API_PATHS } from '@touchbase/shared';
import { api } from '../lib/api-client';

export function useContacts(params?: ListContactsParams) {
  return useQuery({
    queryKey: ['contacts', params],
    queryFn: () =>
      api.get<ListContactsRes>(API_PATHS.contacts, params as Record<string, unknown>),
  });
}

export function useContact(id: string) {
  return useQuery({
    queryKey: ['contact', id],
    queryFn: () => api.get<ContactRes>(API_PATHS.contact(id)),
    enabled: !!id,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateContactReq) =>
      api.post<ContactRes>(API_PATHS.contacts, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateContactReq }) =>
      api.patch<ContactRes>(API_PATHS.contact(id), data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contact', variables.id] });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.del<void>(API_PATHS.contact(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}
