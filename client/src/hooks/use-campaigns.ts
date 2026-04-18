import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import type { Campaign } from '@/types';

function normalizeCampaign(raw: Record<string, unknown>): Campaign {
  const rawNgoId = raw.ngoId;
  let ngo: { _id: string; name: string } | undefined;
  let ngoIdStr: string | undefined;

  if (rawNgoId && typeof rawNgoId === 'object') {
    const o = rawNgoId as { _id: string; organizationName?: string };
    ngo = { _id: o._id, name: o.organizationName ?? 'NGO' };
    ngoIdStr = o._id;
  } else if (typeof rawNgoId === 'string') {
    ngoIdStr = rawNgoId;
  }

  return { ...(raw as object), ngo, ngoId: ngoIdStr } as Campaign;
}

export function useCampaigns(params?: { search?: string, category?: string }) {
  return useQuery({
    queryKey: ['campaigns', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.append('search', params.search);
      if (params?.category) searchParams.append('category', params.category.toUpperCase());
      const queryStr = searchParams.toString();
      const result = await fetchApi<{ campaigns: Record<string, unknown>[]; pagination: unknown }>(
        `/campaigns${queryStr ? `?${queryStr}` : ''}`
      );
      return (result.campaigns ?? []).map((c) => normalizeCampaign(c));
    },
  });
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: ['campaigns', id],
    queryFn: async () => {
      const raw = await fetchApi<Record<string, unknown>>(`/campaigns/${id}`);
      return normalizeCampaign(raw);
    },
    enabled: !!id,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Campaign>) => fetchApi<Campaign>('/campaigns', { method: 'POST', data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Campaign> & { id: string }) => 
      fetchApi<Campaign>(`/campaigns/${id}`, { method: 'PATCH', data }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns', variables.id] });
    },
  });
}

export function useCloseCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchApi<void>(`/campaigns/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}
