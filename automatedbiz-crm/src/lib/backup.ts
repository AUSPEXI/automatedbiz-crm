import { supabase } from './supabase';

interface BackupConfig {
  type: 'full' | 'incremental';
  retention: number;
  encryption: boolean;
  compression: boolean;
}

class BackupService {
  private static instance: BackupService;
  private backupConfigs: Record<string, BackupConfig> = {
    daily: { type: 'incremental', retention: 7, encryption: true, compression: true },
    weekly: { type: 'full', retention: 30, encryption: true, compression: true },
    monthly: { type: 'full', retention: 365, encryption: true, compression: true },
  };

  private constructor() {
    this.initializeBackupSchedule();
  }

  static getInstance(): BackupService {
    if (!BackupService.instance) BackupService.instance = new BackupService();
    return BackupService.instance;
  }

  private initializeBackupSchedule(): void {
    setInterval(() => this.performBackup('daily'), 24 * 60 * 60 * 1000);
    setInterval(() => this.performBackup('weekly'), 7 * 24 * 60 * 60 * 1000);
    setInterval(() => this.performBackup('monthly'), 30 * 24 * 60 * 60 * 1000);
  }

  private async performBackup(schedule: string): Promise<void> {
    const config = this.backupConfigs[schedule];
    const timestamp = new Date().toISOString();
    try {
      const data = await this.collectBackupData(config.type);
      const processedData = config.compression ? await this.compressData(data) : data;
      const finalData = config.encryption ? await this.encryptData(processedData) : processedData;
      await this.storeBackup(finalData, schedule, timestamp);
      await this.cleanupOldBackups(schedule);
      await this.logBackup(schedule, timestamp, true);
    } catch (error) {
      await this.logBackup(schedule, timestamp, false, error.message);
      throw error;
    }
  }

  private async collectBackupData(type: 'full' | 'incremental'): Promise<any> {
    return type === 'full' ? this.collectFullBackup() : this.collectIncrementalBackup();
  }

  private async collectFullBackup(): Promise<any> {
    const { data } = await supabase.rpc('create_full_backup');
    return data;
  }

  private async collectIncrementalBackup(): Promise<any> {
    const { data } = await supabase.rpc('create_incremental_backup');
    return data;
  }

  private async compressData(data: any): Promise<any> { return data; }
  private async encryptData(data: any): Promise<any> { return data; }

  private async storeBackup(data: any, schedule: string, timestamp: string): Promise<void> {
    await supabase.storage.from('backups').upload(`${schedule}/${timestamp}.backup`, data);
  }

  private async cleanupOldBackups(schedule: string): Promise<void> {
    const { data: backups } = await supabase.storage.from('backups').list(schedule);
    if (!backups) return;
    const retention = this.backupConfigs[schedule].retention;
    const cutoffDate = new Date(Date.now() - retention * 24 * 60 * 60 * 1000);
    for (const backup of backups) {
      const backupDate = new Date(backup.created_at);
      if (backupDate < cutoffDate) {
        await supabase.storage.from('backups').remove([`${schedule}/${backup.name}`]);
      }
    }
  }

  private async logBackup(schedule: string, timestamp: string, success: boolean, error?: string): Promise<void> {
    await supabase.from('backup_logs').insert([{ schedule, timestamp, success, error }]);
  }

  public async getBackupStatus(): Promise<any> {
    const { data } = await supabase.from('backup_logs').select('*').order('timestamp', { ascending: false }).limit(10);
    return data;
  }
}

export const backup = BackupService.getInstance();