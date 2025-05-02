
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
        
        setDemandForecasts(data || []);
      } catch (err) {
        console.error('Error fetching predictive demand data:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchDemandData();
  }, []);

  return { demandForecasts, loading, error };
}
