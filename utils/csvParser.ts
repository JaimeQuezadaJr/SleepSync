import * as FileSystem from 'expo-file-system';

export async function parseCSV(fileUri: string) {
  try {
    console.log('Reading CSV from:', fileUri);
    const csvString = await FileSystem.readAsStringAsync(fileUri);
    const lines = csvString.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    console.log('CSV Headers:', headers);

    const parsedRows = lines.slice(1)
      .filter(line => line.trim())
      .map(line => {
        const values = line.split(',').map(v => v.trim());
        const row: any = {};
        
        headers.forEach((header, index) => {
          const value = values[index];
          
          // Map Oura columns to our database fields
          switch (header) {
            case 'date':
              row.date = value; // Already in YYYY-MM-DD format
              break;
            case 'Total Sleep Duration':
              // Convert from seconds to hours
              row.sleep_duration = value ? parseFloat(value) / 3600 : null;
              break;
            case 'Deep Sleep Duration':
              // Convert from seconds to hours
              row.deep_sleep_duration = value ? parseFloat(value) / 3600 : null;
              break;
            case 'REM Sleep Duration':
              // Convert from seconds to hours
              row.rem_sleep_duration = value ? parseFloat(value) / 3600 : null;
              break;
            case 'Light Sleep Duration':
              // Convert from seconds to hours
              row.light_sleep_duration = value ? parseFloat(value) / 3600 : null;
              break;
            case 'Average Resting Heart Rate':
              row.resting_heart_rate = value ? parseFloat(value) : null;
              break;
            case 'Temperature Deviation (°C)':
              row.temperature_deviation = value ? parseFloat(value) : null;
              break;
            case 'Bedtime Start':
              row.bedtime_start = value || null;
              break;
            case 'Bedtime End':
              row.bedtime_end = value || null;
              break;
          }
        });

        console.log('Parsed row:', row);
        return row;
      });

    return parsedRows;
  } catch (error: any) {
    console.error('CSV parsing error:', error);
    throw new Error(`Failed to parse CSV: ${error.message}`);
  }
} 