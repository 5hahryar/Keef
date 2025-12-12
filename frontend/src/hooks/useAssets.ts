import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assetApiService, type CreateAssetRequest, type UpdateAssetRequest } from '../services/assetService';

export const useAssets = () => {
  return useQuery({
    queryKey: ['assets'],
    queryFn: () => assetApiService.getAssets(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!localStorage.getItem('access_token'),
    retry: false,
  });
};

export const useAsset = (id: string) => {
  return useQuery({
    queryKey: ['assets', id],
    queryFn: () => assetApiService.getAsset(id),
    enabled: !!id && !!localStorage.getItem('access_token'),
    retry: false,
  });
};

export const useCreateAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (asset: CreateAssetRequest) => assetApiService.createAsset(asset),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
};

export const useUpdateAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateAssetRequest }) =>
      assetApiService.updateAsset(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['assets', variables.id] });
    },
  });
};

export const useDeleteAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => assetApiService.deleteAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset-transactions'] });
    },
  });
};

