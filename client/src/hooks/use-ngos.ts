import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import type { NGO } from '@/types';

export function useNgos() {
  return useQuery({
    queryKey: ['ngos'],
    queryFn: () => fetchApi<NGO[]>('/ngos'),
  });
}

export function useNgoProfile(id: string) {
  return useQuery({
    queryKey: ['ngos', id],
    queryFn: () => fetchApi<NGO>(`/ngos/${id}`),
    enabled: !!id,
  });
}

export function useApplyNgo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<NGO>) => fetchApi<NGO>('/ngos/apply', { method: 'POST', data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ngos'] });
    },
  });
}

export function useVerifyNgo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string, status: 'verified' | 'rejected' }) => 
      fetchApi<NGO>(`/ngos/${id}/verify`, { method: 'PATCH', data: { status } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ngos'] });
    },
  });
}
