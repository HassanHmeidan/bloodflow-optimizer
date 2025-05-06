
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export type DemandForecast = {
  id: string;
  blood_type: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  short_term_demand: number;
  medium_term_demand: number;
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  last_updated: string;
};

export function usePredictiveDemand() {
  const [demandForecasts, setDemandForecasts] = useState<DemandForecast[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDemandData = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('predictive_demand')
          .select('*');
        
        if (error) throw error;
        
        // Type cast the urgency_level to ensure it matches our DemandForecast type
        const typedData: DemandForecast[] = data?.map(item => ({
          id: item.id,
          blood_type: item.blood_type,
          short_term_demand: item.short_term_demand,
          medium_term_demand: item.medium_term_demand,
          // Cast the urgency_level to the specific union type
          urgency_level: item.urgency_level.toLowerCase() as 'low' | 'medium' | 'high' | 'critical',
          last_updated: item.last_updated
        })) || [];
        
        setDemandForecasts(typedData);
      } catch (err) {
        console.error('Error fetching predictive demand data:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchDemandData();

    // Set up realtime subscription for predictive demand updates
    const channel = supabase
      .channel('predictive-demand-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'predictive_demand'
      }, () => {
        fetchDemandData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { demandForecasts, loading, error };
}

export default usePredictiveDemand;
