import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props {
  data: any;
}

const CampaignMetrics: React.FC<Props> = ({ data }) => (
  <div className="bg-white p-6 rounded-lg border border-gray-200">
    <h3 className="text-lg font-semibold mb-4">Campaign Metrics</h3>
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data.impressions}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#FF3366" name="Impressions" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default CampaignMetrics;