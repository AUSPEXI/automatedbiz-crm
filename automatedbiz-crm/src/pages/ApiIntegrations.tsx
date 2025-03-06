import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { integrationService, IntegrationProvider, UserIntegration } from '../../lib/integrations';
import { oauthService } from '../../lib/oauth';
import { supabase } from '../../lib/supabase';
import { Plug, Settings, ArrowRight, Clock, AlertCircle, Link } from 'lucide-react';

const ApiIntegrations: React.FC = () => {
  const { user } = useAuth();
  const [providers, setProviders] = useState<IntegrationProvider[]>([]);
  const [integrations, setIntegrations] = useState<UserIntegration[]>([]);
  const [syncLogs, setSyncLogs] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIntegration, setSelectedIntegration] = useState<UserIntegration | null>(null);
  const [newWebhook, setNewWebhook] = useState({ eventType: '', endpointUrl: '', secretKey: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [providerData, integrationData, logsData, webhooksData] = await Promise.all([
          integrationService.getProviders(),
          integrationService.getUserIntegrations(user?.id || ''),
          supabase
            .from('integration_sync_logs')
            .select('*')
            .eq('integration_id', integrations.map(i => i.id))
            .order('started_at', { ascending: false })
            .limit(10),
          supabase
            .from('integration_webhooks')
            .select('*')
            .eq('integration_id', integrations.map(i => i.id)),
        ]);
        setProviders(providerData);
        setIntegrations(integrationData);
        setSyncLogs(logsData.data || []);
        setWebhooks(webhooksData.data || []);
      } catch (err) {
        setError('Failed to load integrations: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    const subscriptions = [
      supabase
        .channel('integration_updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'user_integrations', filter: `user_id=eq.${user?.id}` }, () => fetchData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'integration_sync_logs' }, () => fetchData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'integration_webhooks' }, () => fetchData())
        .subscribe(),
    ];

    return () => {
      subscriptions.forEach(sub => supabase.removeChannel(sub));
    };
  }, [user?.id]);

  const handleConnect = (providerId: string) => {
    oauthService.initiateOAuth(providerId);
  };

  const handleManage = (integration: UserIntegration) => {
    setSelectedIntegration(integration);
  };

  const handleAddWebhook = async () => {
    if (!selectedIntegration) return;
    try {
      await supabase.from('integration_webhooks').insert({
        integration_id: selectedIntegration.id,
        event_type: newWebhook.eventType,
        endpoint_url: newWebhook.endpointUrl,
        secret_key: newWebhook.secretKey,
      });
      setNewWebhook({ eventType: '', endpointUrl: '', secretKey: '' });
      fetchData();
    } catch (err) {
      setError('Failed to add webhook: ' + err.message);
    }
  };

  if (loading) return <div>Loading integrations...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">API Integrations</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {providers.map((provider) => {
          const integration = integrations.find(i => i.providerId === provider.id);
          return (
            <div key={provider.id} className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Plug /> {provider.name}
              </h3>
              <p className="text-gray-600">{provider.description}</p>
              <p className="text-gray-500 text-sm">Type: {provider.type} | API: {provider.api_version}</p>
              {integration ? (
                <div className="mt-2 space-y-2">
                  <button
                    onClick={() => handleManage(integration)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg flex items-center space-x-2"
                  >
                    <Settings size={18} /><span>Manage</span>
                  </button>
                  <p className="text-sm text-gray-500">Status: {integration.status}</p>
                  <p className="text-sm text-gray-500">Last Sync: {integration.lastSyncAt ? new Date(integration.lastSyncAt).toLocaleString() : 'Never'}</p>
                </div>
              ) : (
                <button
                  onClick={() => handleConnect(provider.id)}
                  className="mt-2 px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center space-x-2"
                >
                  <ArrowRight size={18} /><span>Connect</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {selectedIntegration && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Manage Integration: {selectedIntegration.providerId}</h2>
            <button
              onClick={() => setSelectedIntegration(null)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Settings size={20} className="text-gray-600" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-md font-medium flex items-center gap-2"><Clock /> Sync Logs</h3>
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                {syncLogs
                  .filter(log => log.integration_id === selectedIntegration.id)
                  .map((log) => (
                    <div key={log.id} className="p-2 bg-gray-100 rounded-lg">
                      <p>Type: {log.sync_type}</p>
                      <p>Status: {log.status}</p>
                      <p className="text-sm text-gray-500">Started: {new Date(log.started_at).toLocaleString()}</p>
                      {log.error_details && <p className="text-red-600 text-sm">Error: {JSON.stringify(log.error_details)}</p>}
                    </div>
                  ))}
              </div>
            </div>
            <div>
              <h3 className="text-md font-medium flex items-center gap-2"><Link /> Webhooks</h3>
              <div className="mt-2 space-y-2">
                {webhooks
                  .filter(w => w.integration_id === selectedIntegration.id)
                  .map((webhook) => (
                    <div key={webhook.id} className="p-2 bg-gray-100 rounded-lg flex justify-between items-center">
                      <p>{webhook.event_type} → {webhook.endpoint_url}</p>
                      <button
                        onClick={async () => {
                          await supabase.from('integration_webhooks').update({ is_active: !webhook.is_active }).eq('id', webhook.id);
                          fetchData();
                        }}
                        className="p-1 text-sm text-gray-600 hover:text-gray-800"
                      >
                        {webhook.is_active ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  ))}
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={newWebhook.eventType}
                    onChange={(e) => setNewWebhook({ ...newWebhook, eventType: e.target.value })}
                    placeholder="Event Type"
                    className="p-2 border rounded flex-1"
                  />
                  <input
                    type="text"
                    value={newWebhook.endpointUrl}
                    onChange={(e) => setNewWebhook({ ...newWebhook, endpointUrl: e.target.value })}
                    placeholder="Endpoint URL"
                    className="p-2 border rounded flex-1"
                  />
                  <input
                    type="text"
                    value={newWebhook.secretKey}
                    onChange={(e) => setNewWebhook({ ...newWebhook, secretKey: e.target.value })}
                    placeholder="Secret Key"
                    className="p-2 border rounded flex-1"
                  />
                  <button
                    onClick={handleAddWebhook}
                    className="px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C]"
                  >
                    Add Webhook
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedIntegration(null)}
              className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiIntegrations;