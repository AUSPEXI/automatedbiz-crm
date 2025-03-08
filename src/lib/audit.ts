import { supabase } from './supabase';

export interface AuditLogEntry {
  userId: string;
  action: string;
  resource: string;
  details?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

class AuditLogger {
  async log(entry: Omit<AuditLogEntry, 'timestamp'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('audit_logs')
        .insert([{
          user_id: entry.userId,
          action: entry.action,
          resource: entry.resource,
          details: entry.details,
          ip_address: entry.ipAddress,
          user_agent: entry.userAgent,
          timestamp: new Date().toISOString(),
        }]);
      if (error) throw error;
    } catch (error) {
      console.error('Failed to write audit log:', error);
    }
  }

  async getAuditLogs(filters: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<AuditLogEntry[]> {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (filters.userId) query = query.eq('user_id', filters.userId);
    if (filters.action) query = query.eq('action', filters.action);
    if (filters.resource) query = query.eq('resource', filters.resource);
    if (filters.startDate) query = query.gte('timestamp', filters.startDate.toISOString());
    if (filters.endDate) query = query.lte('timestamp', filters.endDate.toISOString());
    if (filters.limit) query = query.limit(filters.limit);
    if (filters.offset) query = query.range(filters.offset!, filters.offset! + (filters.limit || 10) - 1);

    const { data, error } = await query;
    if (error) throw error;

    return data.map(log => ({
      userId: log.user_id,
      action: log.action,
      resource: log.resource,
      details: log.details,
      ipAddress: log.ip_address,
      userAgent: log.user_agent,
      timestamp: new Date(log.timestamp),
    }));
  }

  async getAuditSummary(userId: string): Promise<{
    totalActions: number;
    lastAction: Date;
    actionsByType: Record<string, number>;
  }> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;

    const actionsByType = data.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalActions: data.length,
      lastAction: new Date(Math.max(...data.map(log => new Date(log.timestamp).getTime()))),
      actionsByType,
    };
  }
}

export const auditLogger = new AuditLogger();