import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { X, Layers } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSegmentCreated: () => void;
}

const SegmentTemplates: React.FC<Props> = ({ onClose, onSegmentCreated }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [criteria, setCriteria] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      await supabase.from('customer_segments').insert({
        user_id: user?.id,
        name,
        description,
        criteria: JSON.parse(criteria), // Assuming JSON criteria for simplicity
      });
      onSegmentCreated();
      onClose();
    } catch (err) {
      console.error('Error creating segment:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create Segment Template</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
        </div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Segment Name"
          className="w-full p-2 border rounded mb-4"
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="w-full p-2 border rounded mb-4"
        />
        <textarea
          value={criteria}
          onChange={(e) => setCriteria(e.target.value)}
          placeholder='Criteria (e.g., {"age": ">30", "location": "UK"})'
          className="w-full p-2 border rounded mb-4 h-24"
        />
        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center justify-center space-x-2"
        >
          {loading ? 'Creating...' : <><Layers size={18} /><span>Create Segment</span></>}
        </button>
      </div>
    </div>
  );
};

export default SegmentTemplates;