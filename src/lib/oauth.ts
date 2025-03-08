import { supabase } from './supabase';
import { integrationService } from './integrations';

interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
}

class OAuthService {
  async initiateOAuth(providerId: string) {
    try {
      const provider = await integrationService.getProviderById(providerId);
      if (!provider) throw new Error('Provider not found');

      if (process.env.NODE_ENV === 'development') {
        const { data: user } = await supabase.auth.getUser();
        if (!user?.user) throw new Error('User not authenticated');

        await integrationService.connectIntegration({
          userId: user.user.id,
          providerId,
          accessToken: 'mock_access_token',
          refreshToken: 'mock_refresh_token',
          tokenExpiresAt: new Date(Date.now() + 3600000),
          status: 'active',
          apiCalls: { total: 0, successful: 0, failed: 0, lastHour: 0 },
        });
        return true;
      }

      sessionStorage.setItem('oauth_provider_id', providerId);
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: provider.config.client_id || 'mock_client_id',
        redirect_uri: `${window.location.origin}/oauth/callback`,
        scope: provider.config.scopes.join(' '),
        state: this.generateState(),
      });
      window.location.href = `${provider.config.auth_url}?${params.toString()}`;
    } catch (error) {
      console.error('Error initiating OAuth:', error);
      throw error;
    }
  }

  async handleCallback(code: string, state: string) {
    try {
      if (!this.verifyState(state)) throw new Error('Invalid state parameter');
      const providerId = sessionStorage.getItem('oauth_provider_id');
      if (!providerId) throw new Error('Provider ID not found');

      const provider = await integrationService.getProviderById(providerId);
      if (!provider) throw new Error('Provider not found');

      if (process.env.NODE_ENV === 'development') {
        const { data: user } = await supabase.auth.getUser();
        if (!user?.user) throw new Error('User not authenticated');

        await integrationService.connectIntegration({
          userId: user.user.id,
          providerId,
          accessToken: 'mock_access_token',
          refreshToken: 'mock_refresh_token',
          tokenExpiresAt: new Date(Date.now() + 3600000),
          status: 'active',
          apiCalls: { total: 0, successful: 0, failed: 0, lastHour: 0 },
        });
        sessionStorage.removeItem('oauth_provider_id');
        sessionStorage.removeItem('oauth_state');
        return true;
      }

      const response = await fetch(provider.config.token_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: provider.config.client_id || 'mock_client_id',
          client_secret: provider.config.client_secret || 'mock_client_secret',
          redirect_uri: `${window.location.origin}/oauth/callback`,
        }),
      });

      if (!response.ok) throw new Error(`Token exchange failed: ${await response.text()}`);
      const tokens = await response.json();

      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) throw new Error('User not authenticated');

      await integrationService.connectIntegration({
        userId: user.user.id,
        providerId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiresAt: new Date(Date.now() + (tokens.expires_in * 1000)),
        status: 'active',
        apiCalls: { total: 0, successful: 0, failed: 0, lastHour: 0 },
      });

      sessionStorage.removeItem('oauth_provider_id');
      sessionStorage.removeItem('oauth_state');
      return true;
    } catch (error) {
      console.error('Error handling OAuth callback:', error);
      throw error;
    }
  }

  private generateState(): string {
    const state = Math.random().toString(36).substring(2);
    sessionStorage.setItem('oauth_state', state);
    return state;
  }

  private verifyState(state: string): boolean {
    return state === sessionStorage.getItem('oauth_state');
  }
}

export const oauthService = new OAuthService();