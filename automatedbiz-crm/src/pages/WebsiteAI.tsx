import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import VideoProductionWizard from '../components/video/VideoProductionWizard';
import { Brain, Zap, Settings } from 'lucide-react';

const WebsiteAI: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('optimization');
  const [showVideoWizard, setShowVideoWizard] = useState(false);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Website AI Dashboard</h1>
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setActiveTab('optimization')}
          className={`px-4 py-2 rounded-lg ${activeTab === 'optimization' ? 'bg-[#FF3366] text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Optimization
        </button>
        <button
          onClick={() => setActiveTab('automation')}
          className={`px-4 py-2 rounded-lg ${activeTab === 'automation' ? 'bg-[#FF3366] text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Automation
        </button>
        <button
          onClick={() => setActiveTab('video')}
          className={`px-4 py-2 rounded-lg ${activeTab === 'video' ? 'bg-[#FF3366] text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Video Production
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-lg ${activeTab === 'settings' ? 'bg-[#FF3366] text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Settings
        </button>
      </div>
      {activeTab === 'optimization' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold flex items-center gap-2"><Brain /> Website Optimization</h2>
          <p className="mt-2">Optimize website performance for {user?.email}'s business with AI-driven insights.</p>
        </div>
      )}
      {activeTab === 'automation' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold flex items-center gap-2"><Zap /> Website Automation</h2>
          <p className="mt-2">Automate website tasks like content updates and form submissions.</p>
          <button
            className="mt-4 px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center space-x-2"
          >
            <Settings size={18} /><span>Configure Automation</span>
          </button>
        </div>
      )}
      {activeTab === 'video' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold flex items-center gap-2"><Zap /> Video Production</h2>
          <p className="mt-2">Create targeted marketing videos for YouTube, funnels, and more with AI.</p>
          <button
            onClick={() => setShowVideoWizard(true)}
            className="mt-4 px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center space-x-2"
          >
            <Zap size={18} /><span>Generate Video</span>
          </button>
        </div>
      )}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold flex items-center gap-2"><Settings /> Website Settings</h2>
          <p className="mt-2">Configure website AI settings for {user?.email}'s business.</p>
        </div>
      )}
      {showVideoWizard && <VideoProductionWizard onClose={() => setShowVideoWizard(false)} />}
    </div>
  );
};

export default WebsiteAI;