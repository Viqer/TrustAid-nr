import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import type { Donation } from '@/types';

export function useDonorDonations() {
  return useQuery({
    queryKey: ['donations', 'me'],
    queryFn: () => fetchApi<Donation[]>('/donations/me/donations'),
  });
}

export function useCampaignDonations(campaignId: string) {
  return useQuery({
    queryKey: ['donations', 'campaign', campaignId],
    queryFn: () => fetchApi<Donation[]>(`/donations/campaign/${campaignId}/donations`),
    enabled: !!campaignId,
  });
}

export function useCreateDonation() {
  return useMutation({
    mutationFn: (data: { campaignId: string, amount: number }) => 
      fetchApi<Donation>('/donations', { method: 'POST', data }),
  });
}

export function useConfirmDonation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, blockchainTxHash }: { id: string, blockchainTxHash: string }) => 
      fetchApi<Donation>(`/donations/${id}/confirm`, { method: 'PATCH', data: { blockchainTxHash } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

export function useDummyDonate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { campaignId: string, amount: number }) =>
      fetchApi<{ success: true; txHash: string; donationId: string }>('/donations/dummy', {
        method: 'POST',
        data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}
