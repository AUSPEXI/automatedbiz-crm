import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { User, Lock, Plus, Trash2 } from 'lucide-react';

const RoleManagement: React.FC = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<any[]>([]);
  const [newRole, setNewRole] = useState({ name: '', permissions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoles();
  }, [user]);

  const fetchRoles = async () => {
    const { data } = await supabase.from('user_roles').select('*').eq('company_id', user.company_id);
    setRoles(data || []);
    setLoading(false);
  };

  const handleAddRole = async () => {
    await supabase.from('user_roles').insert({ name: newRole.name, company_id: user.company_id });
    setNewRole({ name: '', permissions: [] });
    fetchRoles();
  };

  const handleDeleteRole = async (roleId: string) => {
    await supabase.from('user_roles').delete().eq('id', roleId);
    fetchRoles();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Role Management</h2>
      <div className="flex gap-4">
        <input
          type="text"
          value={newRole.name}
          onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
          placeholder="New Role Name"
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={handleAddRole}
          className="px-4 py-2 bg-[#FF3366] text-white rounded-lg flex items-center space-x-2"
        >
          <Plus size={18} /> <span>Add Role</span>
        </button>
      </div>
      <div className="space-y-4">
        {roles.map((role) => (
          <div key={role.id} className="p-4 border rounded-lg flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <User size={20} />
              <span>{role.name}</span>
            </div>
            <button
              onClick={() => handleDeleteRole(role.id)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Trash2 size={18} className="text-red-600" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoleManagement;