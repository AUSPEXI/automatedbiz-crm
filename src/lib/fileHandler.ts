import { saveAs } from 'file-saver';
import Papa from 'papaparse';

interface ExportOptions {
  filename: string;
  format: 'csv' | 'json' | 'xlsx';
  data: any[];
}

interface ImportOptions {
  file: File;
  format: 'csv' | 'json' | 'xlsx';
  onProgress?: (progress: number) => void;
}

export const fileHandler = {
  async exportData({ filename, format, data }: ExportOptions) {
    try {
      let content: string | Blob;
      let mimeType: string;
      
      switch (format) {
        case 'csv':
          content = Papa.unparse(data);
          mimeType = 'text/csv;charset=utf-8;';
          break;
        case 'json':
          content = JSON.stringify(data, null, 2);
          mimeType = 'application/json;charset=utf-8;';
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
      
      const blob = new Blob([content], { type: mimeType });
      saveAs(blob, `${filename}.${format}`);
      return true;
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error('Failed to export data');
    }
  },

  async importData({ file, format, onProgress }: ImportOptions) {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
          try {
            const content = e.target?.result;
            if (!content) throw new Error('Failed to read file');
            
            let data;
            switch (format) {
              case 'csv':
                data = await new Promise((resolve, reject) => {
                  Papa.parse(content as string, {
                    header: true,
                    complete: (results) => resolve(results.data),
                    error: (error) => reject(error),
                  });
                });
                break;
              case 'json':
                data = JSON.parse(content as string);
                break;
              default:
                throw new Error(`Unsupported format: ${format}`);
            }
            
            resolve(data);
          } catch (error) {
            reject(error);
          }
        };
        
        reader.onprogress = (e) => {
          if (e.lengthComputable && onProgress) {
            onProgress((e.loaded / e.total) * 100);
          }
        };
        
        reader.onerror = () => reject(new Error('Failed to read file'));
        
        switch (format) {
          case 'csv':
          case 'json':
            reader.readAsText(file);
            break;
          default:
            throw new Error(`Unsupported format: ${format}`);
        }
      } catch (error) {
        reject(error);
      }
    });
  },

  validateFile(file: File, allowedTypes: string[], maxSize: number) {
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
    }
    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size: ${maxSize / 1024 / 1024}MB`);
    }
    return true;
  },
};