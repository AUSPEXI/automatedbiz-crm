import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '../lib/supabase';

interface ReportConfig {
  type: string;
  filters: Record<string, any>;
}

interface ReportResult {
  data: any[];
  summary: Record<string, any>;
}

export function useReport(config: ReportConfig) {
  const [report, setReport] = useState<ReportResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const { data } = await supabase.rpc('generate_report', { report_type: config.type, report_filters: config.filters });
        setReport(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [config]);

  const exportReport = async (format: 'csv' | 'json') => {
    if (!report) return;
    try {
      const content = format === 'csv' ? JSON.stringify(report.data) : JSON.stringify(report, null, 2);
      const blob = new Blob([content], { type: `text/${format};charset=utf-8;` });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report.${format}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError(err as Error);
    }
  };

  return { report, loading, error, exportReport };
}