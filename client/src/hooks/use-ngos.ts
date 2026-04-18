import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import type { NGO, NgoApplyForm } from '@/types';

type NgosListPayload = { ngos: NGO[]; pagination?: unknown };

function parseNgosListResponse(raw: unknown): NGO[] {
  if (Array.isArray(raw)) return raw as NGO[];
  if (raw && typeof raw === 'object' && 'ngos' in raw && Array.isArray((raw as NgosListPayload).ngos)) {
    return (raw as NgosListPayload).ngos;
  }
  return [];
}

function mapApplyFormToApi(form: NgoApplyForm) {
  const website = form.website?.trim();
  return {
    organizationName: form.name.trim(),
    registrationNumber: form.registrationNumber.trim(),
    description: form.description.trim(),
    ...(website ? { website } : {}),
    phone: form.phone.trim(),
    address: {
      country: form.country.trim(),
      street: form.address.trim(),
    },
  };
}

export function useNgos() {
  return useQuery({
    queryKey: ['ngos'],
    queryFn: async () => {
      const raw = await fetchApi<unknown>('/ngos');
      return parseNgosListResponse(raw);
    },
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
    mutationFn: (form: NgoApplyForm) =>
      fetchApi<{ ngo: NGO; user: unknown }>('/ngos/apply', {
        method: 'POST',
        data: mapApplyFormToApi(form),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ngos'] });
    },
  });
}

export function useVerifyNgo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: 'verified' | 'rejected' | 'VERIFIED' | 'REJECTED';
    }) => {
      const normalized = String(status).toUpperCase();
      const apiStatus = normalized === 'VERIFIED' ? 'VERIFIED' : 'REJECTED';
      return fetchApi<NGO>(`/ngos/${id}/verify`, {
        method: 'PATCH',
        data: { status: apiStatus },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ngos'] });
    },
  });
}
