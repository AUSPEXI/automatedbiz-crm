import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { oauthService } from '../lib/oauth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    if (code && state) {
      oauthService.handleCallback(code, state)
        .then(() => navigate('/integrations'))
        .catch(err => console.error('OAuth callback error:', err));
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Authenticating...</h1>
        <p className="text-gray-600">Please wait while we connect your integration.</p>
        <div className="mt-4 animate-spin rounded-full h-8 w-8 border-4 border-[#FF3366] border-t-transparent mx-auto"></div>
      </div>
    </div>
  );
};

export default OAuthCallback;