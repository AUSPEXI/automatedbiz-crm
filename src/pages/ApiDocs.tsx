import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { integrationService, IntegrationProvider } from '../../lib/integrations';
import { supabase } from '../../lib/supabase';
import { Book, Code, Eye } from 'lucide-react';

const ApiDocs: React.FC = () => {
  const { user } = useAuth();
  const [providers, setProviders] = useState<IntegrationProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const data = await integrationService.getProviders();
        setProviders(data);
        supabase.from('analytics_events').insert({
          user_id: user?.id,
          type: 'api_docs_viewed',
          data: { providers: data.map(p => p.name) },
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        setError('Failed to load API docs: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
  }, [user?.id]);

  if (loading) return <div>Loading API documentation...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">API Documentation</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {providers.map((provider) => (
          <div key={provider.id} className="bg-white p-4 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Book /> {provider.name}
            </h2>
            <p className="text-gray-600">{provider.description}</p>
            <p className="text-gray-500 text-sm">Type: {provider.type} | API: {provider.api_version}</p>
            {provider.documentation_url ? (
              <a
                href={provider.documentation_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-[#FF3366] hover:text-[#E62E5C]"
              >
                <Eye size={16} /> View Docs
              </a>
            ) : (
              <div className="mt-2 space-y-2">
                <h3 className="text-md font-medium flex items-center gap-2"><Code /> Sample API Call</h3>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
                  {`GET ${provider.config.auth_url}
Headers: Authorization: Bearer your_access_token
Body: { "scope": "${provider.config.scopes.join(', ')}" }`}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApiDocs;