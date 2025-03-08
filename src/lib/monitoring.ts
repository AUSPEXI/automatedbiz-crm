import { supabase } from './supabase';

interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  latency: number;
  lastChecked: Date;
  error?: string;
}

interface SystemMetrics {
  cpu: number;
  memory: number;
  requests: number;
  errors: number;
  latency: number;
}

class MonitoringService {
  private static instance: MonitoringService;
  private healthChecks: Map<string, HealthCheck> = new Map();
  private checkInterval: number = 60000; // 1 minute
  private metricsInterval: number = 300000; // 5 minutes

  private constructor() {
    this.startHealthChecks();
    this.startMetricsCollection();
  }

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) MonitoringService.instance = new MonitoringService();
    return MonitoringService.instance;
  }

  private async startHealthChecks(): Promise<void> {
    setInterval(async () => {
      await this.checkIntegrationHealth();
      await this.checkDatabaseHealth();
      await this.checkAPIHealth();
    }, this.checkInterval);
  }

  private async startMetricsCollection(): Promise<void> {
    setInterval(async () => {
      const metrics = await this.collectSystemMetrics();
      await this.storeMetrics(metrics);
    }, this.metricsInterval);
  }

  private async checkIntegrationHealth(): Promise<void> {
    const integrations = ['openai', 'resend', 'supabase'];
    for (const integration of integrations) {
      try {
        const startTime = Date.now();
        await this.pingIntegration(integration);
        this.healthChecks.set(integration, {
          service: integration,
          status: 'healthy',
          latency: Date.now() - startTime,
          lastChecked: new Date(),
        });
      } catch (error) {
        this.healthChecks.set(integration, {
          service: integration,
          status: 'down',
          latency: 0,
          lastChecked: new Date(),
          error: error.message,
        });
        await this.alertOnFailure(integration, error);
      }
    }
  }

  private async checkDatabaseHealth(): Promise<void> {
    try {
      const startTime = Date.now();
      const { data, error } = await supabase.from('health_check').select('*').limit(1);
      if (error) throw error;
      this.healthChecks.set('database', {
        service: 'database',
        status: 'healthy',
        latency: Date.now() - startTime,
        lastChecked: new Date(),
      });
    } catch (error) {
      this.healthChecks.set('database', {
        service: 'database',
        status: 'down',
        latency: 0,
        lastChecked: new Date(),
        error: error.message,
      });
      await this.alertOnFailure('database', error);
    }
  }

  private async checkAPIHealth(): Promise<void> {
    const endpoints = ['/api/health', '/api/status'];
    for (const endpoint of endpoints) {
      try {
        const startTime = Date.now();
        const response = await fetch(endpoint);
        this.healthChecks.set(endpoint, {
          service: endpoint,
          status: response.ok ? 'healthy' : 'degraded',
          latency: Date.now() - startTime,
          lastChecked: new Date(),
        });
      } catch (error) {
        this.healthChecks.set(endpoint, {
          service: endpoint,
          status: 'down',
          latency: 0,
          lastChecked: new Date(),
          error: error.message,
        });
        await this.alertOnFailure(endpoint, error);
      }
    }
  }

  private async collectSystemMetrics(): Promise<SystemMetrics> {
    return { cpu: 0, memory: 0, requests: 0, errors: 0, latency: 0 }; // Mock implementation
  }

  private async storeMetrics(metrics: SystemMetrics): Promise<void> {
    await supabase.from('system_metrics').insert([{ ...metrics, timestamp: new Date().toISOString() }]);
  }

  private async alertOnFailure(service: string, error: Error): Promise<void> {
    await supabase.from('alerts').insert([{ service, error: error.message, timestamp: new Date().toISOString() }]);
  }

  private async pingIntegration(integration: string): Promise<void> { /* Mock implementation */ }
  private async getCPUUsage(): Promise<number> { return 0; }
  private async getMemoryUsage(): Promise<number> { return 0; }
  private async getRequestRate(): Promise<number> { return 0; }
  private async getErrorRate(): Promise<number> { return 0; }
  private async getAverageLatency(): Promise<number> { return 0; }

  public getHealthStatus(): Map<string, HealthCheck> {
    return new Map(this.healthChecks);
  }

  public async getMetrics(timeRange: string): Promise<SystemMetrics[]> {
    const { data } = await supabase
      .from('system_metrics')
      .select('*')
      .gte('timestamp', new Date(Date.now() - this.parseTimeRange(timeRange)))
      .order('timestamp', { ascending: false });
    return data || [];
  }

  private parseTimeRange(range: string): number {
    const units: Record<string, number> = { h: 3600000, d: 86400000, w: 604800000 };
    const match = range.match(/(\d+)([hdw])/);
    return match ? parseInt(match[1]) * units[match[2]] : 86400000;
  }
}

export const monitoring = MonitoringService.getInstance();