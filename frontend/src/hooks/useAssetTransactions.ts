import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assetApiService, type CreateAssetTransactionRequest } from '../services/assetService';

export const useAssetTransactions = (assetId?: string) => {
  return useQuery({
    queryKey: ['asset-transactions', assetId],
    queryFn: () => assetApiService.getTransactions(assetId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!localStorage.getItem('access_token'),
    retry: false,
  });
};

export const useCreateAssetTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (transaction: CreateAssetTransactionRequest) =>
      assetApiService.createTransaction(transaction),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['asset-transactions', variables.assetId] });
    },
  });
};

export const useDeleteAssetTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; assetId?: string }) =>
      assetApiService.deleteTransaction(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset-transactions'] });
      if (variables.assetId) {
        queryClient.invalidateQueries({ queryKey: ['asset-transactions', variables.assetId] });
      }
    },
  });
};

