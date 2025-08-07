import cron from 'node-cron';
import { sendAllWeeklyReports, sendDailyParadeReport } from '../services/emailService.js';

// Schedule weekly reports to be sent every Monday at 9:00 AM
const scheduleWeeklyReports = () => {
  console.log('📅 Setting up weekly email report scheduler...');
  
  // Run every Monday at 9:00 AM (0 9 * * 1)
  cron.schedule('0 9 * * 1', async () => {
    console.log('🔄 Starting scheduled weekly attendance reports...');
    
    try {
      const results = await sendAllWeeklyReports();
      
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;
      
      console.log(`✅ Weekly reports completed: ${successCount} successful, ${failCount} failed`);
      
      // Log any failures
      const failures = results.filter(r => !r.success);
      if (failures.length > 0) {
        console.log('❌ Failed reports:', failures);
      }
      
    } catch (error) {
      console.error('❌ Error in scheduled weekly reports:', error);
    }
  });
  
  console.log('✅ Weekly email report scheduler activated (Every Monday at 9:00 AM)');
};

// Schedule daily parade reports to be sent every day at 5:00 PM
const scheduleDailyParadeReports = () => {
  console.log('📅 Setting up daily parade email report scheduler...');
  
  // Run every day at 5:00 PM (0 17 * * *)
  cron.schedule('0 17 * * *', async () => {
    console.log('🔄 Starting scheduled daily parade reports...');
    
    try {
      const result = await sendDailyParadeReport();
      
      if (result.success) {
        console.log(`✅ Daily parade reports completed: ${result.message}`);
        
        if (result.results) {
          const successCount = result.results.filter(r => r.success).length;
          const failCount = result.results.filter(r => !r.success).length;
          console.log(`📊 Breakdown: ${successCount} successful, ${failCount} failed`);
          
          // Log any failures
          const failures = result.results.filter(r => !r.success);
          if (failures.length > 0) {
            console.log('❌ Failed parade reports:', failures);
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Error in scheduled daily parade reports:', error);
    }
  });
  
  console.log('✅ Daily parade email report scheduler activated (Every day at 5:00 PM)');
};

// Initialize scheduler only in production or when explicitly enabled
export const initializeScheduler = () => {
  const enableScheduler = process.env.ENABLE_SCHEDULER === 'true' || process.env.NODE_ENV === 'production';
  
  if (enableScheduler) {
    scheduleWeeklyReports();
    scheduleDailyParadeReports();
  } else {
    console.log('⏸️ Email scheduler disabled (Set ENABLE_SCHEDULER=true to enable)');
  }
};

export default {
  initializeScheduler,
  scheduleWeeklyReports,
  scheduleDailyParadeReports
};
