import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useHelpStats = () => {
  return useQuery({
    queryKey: ['help-stats'],
    queryFn: async () => {
      const [requestsResult, offersResult] = await Promise.all([
        supabase
          .from('help_requests')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'open'),
        supabase
          .from('help_offers')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'available')
      ]);

      return {
        helpRequestsCount: requestsResult.count || 0,
        helpOffersCount: offersResult.count || 0
      };
    },
    refetchInterval: 30000 // Refetch every 30 seconds
  });
};
