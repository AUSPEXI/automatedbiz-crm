export function useRealtimeMetric(metric: string) {
  // ... existing code ...
  useEffect(() => {
    const channel = supabase
      .channel('realtime_metrics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'metrics', filter: `name=eq.${metric}` }, (payload) => {
        setValue(payload.new.value);
      })
      .subscribe();

    const fetchInitialValue = async () => {
      try {
        const { data } = await supabase.from('metrics').select('value').eq('name', metric).single();
        setValue(data?.value || (metric === 'video_engagement' ? { optimal_duration: 60, engagement_boost: 10 } : 0));
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialValue();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [metric]);
  // ... rest of the code ...
}