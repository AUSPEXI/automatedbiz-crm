import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { X, Plus } from 'lucide-react';

interface Props {
  onClose: () => void;
}

const CreateCampaignModal: React.FC<Props> = ({ onClose }) => {
  const [name, setName] = useState('');

  const handleSubmit = () => {
    // Create campaign logic here
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create Campaign</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
        </div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Campaign Name"
          className="w-full p-2 border rounded mb-4"
        />
        <button
          onClick={handleSubmit}
          className="w-full px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center justify-center space-x-2"
        >
          <Plus size={18} /><span>Create Campaign</span>
        </button>
      </div>
    </div>
  );
};

export default CreateCampaignModal;