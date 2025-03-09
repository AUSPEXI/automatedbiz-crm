import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { X, PoundSterling } from 'lucide-react';

interface Props {
  onClose: () => void;
}

const AddBudgetModal: React.FC<Props> = ({ onClose }) => {
  const [amount, setAmount] = useState('');

  const handleSubmit = () => {
    // Add budget logic here
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add Budget</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
        </div>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount in £"
          className="w-full p-2 border rounded mb-4"
        />
        <button
          onClick={handleSubmit}
          className="w-full px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center justify-center space-x-2"
        >
          <PoundSterling size={18} /><span>Add Budget</span>
        </button>
      </div>
    </div>
  );
};

export default AddBudgetModal;