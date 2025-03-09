import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { X } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSave: (leadData: any) => void;
}

const AddLeadModal: React.FC<Props> = ({ onClose, onSave }) => {
  const [leadData, setLeadData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    status: 'New',
    score: 0,
    lastContact: new Date().toISOString().split('T')[0],
    value: 0,
    source: '',
  });

  const handleChange = (field: string, value: string | number) => {
    setLeadData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSave(leadData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add New Lead</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
        </div>
        <input
          type="text"
          value={leadData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Name"
          className="w-full p-2 border rounded mb-4"
        />
        <input
          type="text"
          value={leadData.company}
          onChange={(e) => handleChange('company', e.target.value)}
          placeholder="Company"
          className="w-full p-2 border rounded mb-4"
        />
        <input
          type="email"
          value={leadData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="Email"
          className="w-full p-2 border rounded mb-4"
        />
        <input
          type="tel"
          value={leadData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          placeholder="Phone"
          className="w-full p-2 border rounded mb-4"
        />
        <select
          value={leadData.status}
          onChange={(e) => handleChange('status', e.target.value)}
          className="w-full p-2 border rounded mb-4"
        >
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Proposal">Proposal</option>
          <option value="Negotiation">Negotiation</option>
          <option value="Won">Won</option>
          <option value="Lost">Lost</option>
        </select>
        <input
          type="number"
          value={leadData.score}
          onChange={(e) => handleChange('score', Number(e.target.value))}
          placeholder="Score"
          className="w-full p-2 border rounded mb-4"
        />
        <input
          type="date"
          value={leadData.lastContact}
          onChange={(e) => handleChange('lastContact', e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <input
          type="number"
          value={leadData.value}
          onChange={(e) => handleChange('value', Number(e.target.value))}
          placeholder="Value"
          className="w-full p-2 border rounded mb-4"
        />
        <input
          type="text"
          value={leadData.source}
          onChange={(e) => handleChange('source', e.target.value)}
          placeholder="Source"
          className="w-full p-2 border rounded mb-4"
        />
        <button
          onClick={handleSubmit}
          className="w-full px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C]"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default AddLeadModal;