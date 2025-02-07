export interface ValidationError {
  field: string;
  message: string;
}

export function validateSleepData(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  // Required fields
  if (!data.date) {
    errors.push({ field: 'date', message: 'Date is required' });
  }

  // Date format validation
  if (data.date && !isValidDate(data.date)) {
    errors.push({ field: 'date', message: 'Invalid date format' });
  }

  // Numeric validations with reasonable ranges
  if (data.sleep_duration !== null) {
    if (data.sleep_duration < 0 || data.sleep_duration > 24) {
      errors.push({ field: 'sleep_duration', message: 'Sleep duration must be between 0 and 24 hours' });
    }
  }

  if (data.deep_sleep_duration !== null) {
    if (data.deep_sleep_duration < 0 || data.deep_sleep_duration > data.sleep_duration) {
      errors.push({ field: 'deep_sleep_duration', message: 'Deep sleep cannot exceed total sleep duration' });
    }
  }

  if (data.rem_sleep_duration !== null) {
    if (data.rem_sleep_duration < 0 || data.rem_sleep_duration > data.sleep_duration) {
      errors.push({ field: 'rem_sleep_duration', message: 'REM sleep cannot exceed total sleep duration' });
    }
  }

  if (data.light_sleep_duration !== null) {
    if (data.light_sleep_duration < 0 || data.light_sleep_duration > data.sleep_duration) {
      errors.push({ field: 'light_sleep_duration', message: 'Light sleep cannot exceed total sleep duration' });
    }
  }

  // Validate total sleep stages don't exceed total sleep duration
  const totalStages = (data.deep_sleep_duration || 0) + 
                     (data.rem_sleep_duration || 0) + 
                     (data.light_sleep_duration || 0);
  
  if (totalStages > (data.sleep_duration || 0) + 0.1) { // Adding 0.1 for floating point comparison
    errors.push({ 
      field: 'sleep_stages', 
      message: 'Total sleep stages cannot exceed total sleep duration' 
    });
  }

  if (data.resting_heart_rate !== null) {
    if (data.resting_heart_rate < 30 || data.resting_heart_rate > 200) {
      errors.push({ field: 'resting_heart_rate', message: 'Heart rate must be between 30 and 200' });
    }
  }

  if (data.temperature_deviation !== null) {
    if (data.temperature_deviation < -3 || data.temperature_deviation > 3) {
      errors.push({ field: 'temperature_deviation', message: 'Temperature deviation must be between -3 and 3' });
    }
  }

  // Validate bedtime sequence
  if (data.bedtime_start && data.bedtime_end) {
    const start = new Date(data.bedtime_start);
    const end = new Date(data.bedtime_end);
    if (start >= end) {
      errors.push({ field: 'bedtime', message: 'Bedtime end must be after bedtime start' });
    }
  }

  return errors;
}

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

export function formatSleepData(data: any) {
  return {
    date: data.date,
    sleep_duration: data.sleep_duration ? Number(data.sleep_duration) : null,
    deep_sleep_duration: data.deep_sleep_duration ? Number(data.deep_sleep_duration) : null,
    rem_sleep_duration: data.rem_sleep_duration ? Number(data.rem_sleep_duration) : null,
    light_sleep_duration: data.light_sleep_duration ? Number(data.light_sleep_duration) : null,
    resting_heart_rate: data.resting_heart_rate ? Math.round(Number(data.resting_heart_rate)) : null,
    temperature_deviation: data.temperature_deviation ? Number(data.temperature_deviation) : null,
    bedtime_start: data.bedtime_start || null,
    bedtime_end: data.bedtime_end || null,
  };
} 