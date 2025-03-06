import { supabase } from './supabase';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'down';
  services: Record<string, {
    status: 'healthy' | 'degraded' | 'down';
    latency: number;
    lastChecked: Date;
    error?: string;
  }>;
  timestamp: Date;
}

class HealthCheck {
  private static instance: HealthCheck;
  private status: HealthStatus = {
    status: 'healthy',
    services: {},
    timestamp: new Date(),
  };

  private constructor() {
    this.startHealthChecks();
  }

  static getInstance(): HealthCheck {
    if (!HealthCheck.instance) HealthCheck.instance = new HealthCheck();
    return HealthCheck.instance;
  }

  private startHealthChecks(): void {
    setInterval(() => this.checkHealth(), 60000); // Every minute
  }

  private async checkHealth(): Promise<void> {
    const services = [
      this.checkDatabase(),
      this.checkAPI(),
      this.checkStorage(),
      this.checkIntegrations(),
    ];
    const results = await Promise.all(services);
    this.status = {
      status: this.determineOverallStatus(results),
      services: Object.assign({}, ...results),
      timestamp: new Date(),
    };
    await this.logHealthStatus();
  }

  private determineOverallStatus(results: any[]): 'healthy' | 'degraded' | 'down' {
    const statuses = results.map(r => Object.values(r)[0].status);
    if (statuses.includes('down')) return 'down';
    if (statuses.includes('degraded')) return 'degraded';
    return 'healthy';
  }

  private async checkDatabase(): Promise<Record<string, any>> {
    try {
      const startTime = Date.now();
      const { data, error } = await supabase.from('health_check').select('*').limit(1);
      if (error) throw error;
      return { database: { status: 'healthy', latency: Date.now() - startTime, lastChecked: new Date() } };
    } catch (error) {
      return { database: { status: 'down', latency: 0, lastChecked: new Date(), error: error.message } };
    }
  }

  private async checkAPI(): Promise<Record<string, any>> {
    try {
      const startTime = Date.now();
      const response = await fetch('/api/health');
      return { api: { status: response.ok ? 'healthy' : 'degraded', latency: Date.now() - startTime, lastChecked: new Date() } };
    } catch (error) {
      return { api: { status: 'down', latency: 0, lastChecked: new Date(), error: error.message } };
    }
  }

  private async checkStorage(): Promise<Record<string, any>> {
    try {
      const startTime = Date.now();
      const { data, error } = await supabase.storage.from('health-check').list();
      if (error) throw error;
      return { storage: { status: 'healthy', latency: Date.now() - startTime, lastChecked: new Date() } };
    } catch (error) {
      return { storage: { status: 'down', latency: 0, lastChecked: new Date(), error: error.message } };
    }
  }

  private async checkIntegrations(): Promise<Record<string, any>> {
    const integrations = { openai: 'https://api.openai.com/v1/models', resend: 'https://api.resend.com/health' };
    const results: Record<string, any> = {};

    for (const [name, url] of Object.entries(integrations)) {
      try {
        const startTime = Date.now();
        const response = await fetch(url);
        results[name] = { status: response.ok ? 'healthy' : 'degraded', latency: Date.now() - startTime, lastChecked: new Date() };
      } catch (error) {
        results[name] = { status: 'down', latency: 0, lastChecked: new Date(), error: error.message };
      }
    }
    return results;
  }

  private async logHealthStatus(): Promise<void> {
    await supabase.from('health_logs').insert([{ status: this.status.status, services: this.status.services, timestamp: this.status.timestamp }]);
  }

  public getStatus(): HealthStatus {
    return { ...this.status };
  }

  public async getHealthHistory(hours: number = 24): Promise<any[]> {
    const { data } = await supabase
      .from('health_logs')
      .select('*')
      .gte('timestamp', new Date(Date.now() - hours * 60 * 60 * 1000))
      .order('timestamp', { ascending: false });
    return data || [];
  }
}

export const healthCheck = HealthCheck.getInstance();