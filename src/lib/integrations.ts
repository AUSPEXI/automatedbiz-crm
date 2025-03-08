import { supabase } from './supabase';

export interface IntegrationProvider {
  id: string;
  name: string;
  type: 'CRM' | 'EMAIL' | 'SOCIAL' | 'ANALYTICS';
  apiVersion: string;
  config: { authUrl: string; tokenUrl: string; scopes: string[]; webhookEvents: string[] };
  // ... other fields
}

export interface UserIntegration {
  id: string;
  userId: string;
  providerId: string;
  accessToken: string;
  // ... other fields
}

export class IntegrationService {
  async getProviders(): Promise<IntegrationProvider[]> {
    const { data } = await supabase.from('integration_providers').select('*').eq('is_active', true);
    return data || [];
  }

  async getUserIntegrations(userId: string): Promise<UserIntegration[]> {
    const { data } = await supabase
      .from('user_integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');
    return data || [];
  }

  async syncApiData(userId: string, providerId: string, accessToken: string) {
    const provider = await this.getProviders().then(p => p.find(p => p.id === providerId));
    if (!provider) throw new Error('Provider not found');

    // Mock Salesforce API call (replace with real API)
    const response = await fetch(provider.config.authUrl, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await response.json();

    // Encrypt and store data securely
    const encryptedData = await encryptData(data);
    await supabase.from('integration_sync_logs').insert({
      integration_id: providerId,
      sync_type: 'api_pull',
      status: 'completed',
      records_processed: data.length,
    });

    return data;
  }
}