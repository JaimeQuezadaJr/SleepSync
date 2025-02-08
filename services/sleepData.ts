import { supabase } from '../lib/supabase';
import { SleepData } from '../types/database';
import { validateSleepData, formatSleepData, ValidationError } from '../utils/validation';

export const sleepDataService = {
  async fetchUserSleepData(userId: string, limit = 7): Promise<{ data: SleepData[] | null; error: any }> {
    try {
      console.log('Fetching data for user:', userId);
      const { data, error } = await supabase
        .from('sleep_data')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(limit);

      const sortedData = data?.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      });

      console.log('Sorted dates:', sortedData?.map(d => d.date));
      
      if (error) throw error;
      return { data: sortedData, error: null };
    } catch (error) {
      console.error('Fetch error:', error);
      return { data: null, error };
    }
  },

  async addSleepData(userId: string, data: any): Promise<{ data: SleepData | null; error: ValidationError[] | any }> {
    try {
      console.log('Adding sleep data for user:', userId);
      console.log('Input data:', data);
      
      // Validate the data
      const validationErrors = validateSleepData(data);
      if (validationErrors.length > 0) {
        console.log('Validation errors:', validationErrors);
        return { data: null, error: validationErrors };
      }

      // Format the data
      const formattedData = formatSleepData(data);
      console.log('Formatted data:', formattedData);

      // Prepare the insert data
      const sleepDataWithUser = {
        user_id: userId,
        date: formattedData.date,
        sleep_duration: formattedData.sleep_duration,
        deep_sleep_duration: formattedData.deep_sleep_duration,
        rem_sleep_duration: formattedData.rem_sleep_duration,
        light_sleep_duration: formattedData.light_sleep_duration,
        resting_heart_rate: formattedData.resting_heart_rate,
        temperature_deviation: formattedData.temperature_deviation,
        bedtime_start: formattedData.bedtime_start,
        bedtime_end: formattedData.bedtime_end
      };
      
      console.log('Data to insert:', sleepDataWithUser);

      // Attempt the insert
      const { data: insertedData, error: insertError } = await supabase
        .from('sleep_data')
        .upsert([sleepDataWithUser], {
          onConflict: 'user_id,date',
          ignoreDuplicates: false  // This will update existing records
        })
        .select('*')
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      console.log('Successfully inserted data:', insertedData);
      return { data: insertedData, error: null };
    } catch (error: any) {
      console.error('Add sleep data error:', error);
      return { data: null, error: error.message };
    }
  },

  async checkStoredData(userId: string): Promise<void> {
    console.log('Checking data for user:', userId);
    const { data, error } = await supabase
      .from('sleep_data')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Storage check error:', error);
    } else {
      console.log('Found stored data:', data?.length, 'records');
      if (data && data.length > 0) {
        console.log('Sample record:', data[0]);
      }
    }
  },

  async deleteSleepData(userId: string, date: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('sleep_data')
        .delete()
        .eq('user_id', userId)
        .eq('date', date);
      
      return { error };
    } catch (error) {
      console.error('Delete error:', error);
      return { error };
    }
  },
}; 