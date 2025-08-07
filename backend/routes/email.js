import express from 'express';
import { sendWeeklyReport, sendAllWeeklyReports, sendDailyParadeReport } from '../services/emailService.js';
import { authenticateToken } from './auth.js';
import { checkAuthorization, checkSuperAdminPermission } from '../middleware/accessControl.js';

const router = express.Router();

// Send weekly report for a specific branch (Super admin only)
router.post('/weekly/:branch', checkAuthorization, checkSuperAdminPermission, async (req, res) => {
  try {
    const { branch } = req.params;
    
    // Validate branch
    const validBranches = [
      'Computer Science & Engineering (CSE)',
      'CSE – Artificial Intelligence & Machine Learning (AIML)',
      'CSE – Data Science (CS DS)',
      'Electronics & Communication Engineering (ECE)',
      'Information Technology (IT)',
      'Electrical & Electronics Engineering (EEE)',
      'Mechanical Engineering (ME)',
      'Civil Engineering (CE)'
    ];
    
    if (!validBranches.includes(branch)) {
      return res.status(400).json({ error: 'Invalid branch name' });
    }
    
    const result = await sendWeeklyReport(branch);
    
    res.json({
      message: 'Weekly report sent successfully',
      ...result
    });
    
  } catch (error) {
    console.error('Error sending weekly report:', error);
    res.status(500).json({ 
      error: 'Failed to send weekly report',
      details: error.message 
    });
  }
});

// Send weekly reports for all branches (Super admin only)
router.post('/weekly/all', checkAuthorization, checkSuperAdminPermission, async (req, res) => {
  try {
    const results = await sendAllWeeklyReports();
    
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    res.json({
      message: `Weekly reports processed for all branches`,
      summary: {
        totalBranches: results.length,
        successful: successCount,
        failed: failCount
      },
      results
    });
    
  } catch (error) {
    console.error('Error sending weekly reports:', error);
    res.status(500).json({ 
      error: 'Failed to send weekly reports',
      details: error.message 
    });
  }
});

// Get available branches for email reports
router.get('/branches', checkAuthorization, checkSuperAdminPermission, async (req, res) => {
  try {
    const branches = [
      'Computer Science & Engineering (CSE)',
      'CSE – Artificial Intelligence & Machine Learning (AIML)',
      'CSE – Data Science (CS DS)',
      'Electronics & Communication Engineering (ECE)',
      'Information Technology (IT)',
      'Electrical & Electronics Engineering (EEE)',
      'Mechanical Engineering (ME)',
      'Civil Engineering (CE)'
    ];
    
    res.json(branches);
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
});

// Test email configuration (Super admin only)
router.post('/test', checkAuthorization, checkSuperAdminPermission, async (req, res) => {
  try {
    const { testEmail } = req.body;
    
    if (!testEmail) {
      return res.status(400).json({ error: 'Test email address is required' });
    }
    
    // Import nodemailer for test
    const nodemailer = await import('nodemailer');
    
    const transporter = nodemailer.default.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: testEmail,
      subject: '🧪 NCC Email Service Test',
      html: `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <h2>🎖️ NCC Email Service Test</h2>
          <p>This is a test email from the NCC Management System.</p>
          <p><strong>Test conducted on:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Email service status:</strong> ✅ Working correctly</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            This is an automated test email. Please do not reply.
          </p>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    res.json({
      message: 'Test email sent successfully',
      messageId: info.messageId,
      testEmail
    });
    
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ 
      error: 'Failed to send test email',
      details: error.message 
    });
  }
});

// Send daily parade reports (Super admin only)
router.post('/daily-parade', checkAuthorization, checkSuperAdminPermission, async (req, res) => {
  try {
    const result = await sendDailyParadeReport();
    
    res.json({
      message: result.message,
      success: result.success,
      results: result.results
    });
    
  } catch (error) {
    console.error('Error sending daily parade reports:', error);
    res.status(500).json({ 
      error: 'Failed to send daily parade reports',
      details: error.message 
    });
  }
});

export default router;
