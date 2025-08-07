import nodemailer from 'nodemailer';
import Student from '../models/Student.js';
import Parade from '../models/Parade.js';
import Attendance from '../models/Attendance.js';

// Email configuration (using environment variables for security)
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD // Use app-specific password for Gmail
    }
  });
};

// Generate weekly attendance report for a specific branch
const generateWeeklyReport = async (branch, startDate, endDate) => {
  try {
    // Get students from the specific branch
    const students = await Student.find({ 
      branch,
      isActive: true 
    }).sort({ name: 1 });

    // Get parades from the date range
    const parades = await Parade.find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: 1 });

    const report = {
      branch,
      period: `${startDate.toDateString()} to ${endDate.toDateString()}`,
      students: [],
      summary: {
        totalStudents: students.length,
        totalParades: parades.length,
        averageAttendance: 0
      }
    };

    let totalAttendanceRate = 0;

    for (const student of students) {
      const studentReport = {
        name: student.name,
        regimentalNumber: student.regimentalNumber,
        rollNumber: student.rollNumber,
        category: student.category,
        rank: student.rank,
        attendance: [],
        stats: {
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          attendanceRate: 0
        }
      };

      for (const parade of parades) {
        const attendance = await Attendance.findOne({
          student: student._id,
          parade: parade._id
        });

        const status = attendance ? attendance.status : 'Not Marked';
        studentReport.attendance.push({
          paradeId: parade._id,
          paradeName: parade.name,
          paradeDate: parade.date,
          status,
          remarks: attendance ? attendance.remarks : null
        });

        // Count attendance stats
        if (status === 'Present') studentReport.stats.present++;
        else if (status === 'Absent') studentReport.stats.absent++;
        else if (status === 'Late') studentReport.stats.late++;
        else if (status === 'Excused') studentReport.stats.excused++;
      }

      // Calculate attendance rate
      const totalMarked = studentReport.stats.present + studentReport.stats.absent + 
                         studentReport.stats.late + studentReport.stats.excused;
      
      if (totalMarked > 0) {
        studentReport.stats.attendanceRate = 
          ((studentReport.stats.present + studentReport.stats.late) / totalMarked) * 100;
      }

      totalAttendanceRate += studentReport.stats.attendanceRate;
      report.students.push(studentReport);
    }

    // Calculate average attendance for the branch
    if (students.length > 0) {
      report.summary.averageAttendance = totalAttendanceRate / students.length;
    }

    return report;
  } catch (error) {
    console.error('Error generating weekly report:', error);
    throw error;
  }
};

// Generate HTML email template
const generateEmailHTML = (report) => {
  const studentsTable = report.students.map(student => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">${student.rollNumber || 'N/A'}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${student.regimentalNumber}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${student.name}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${student.category}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${student.rank}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${student.stats.present}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${student.stats.absent}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${student.stats.late}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${student.stats.excused}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${student.stats.attendanceRate.toFixed(1)}%</td>
    </tr>
  `).join('');

  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #34495e; color: white; padding: 12px; text-align: left; border: 1px solid #ddd; }
          td { padding: 8px; border: 1px solid #ddd; }
          .summary { background-color: #ecf0f1; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .footer { text-align: center; margin-top: 30px; color: #7f8c8d; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎖️ NCC Weekly Attendance Report</h1>
          <h2>${report.branch}</h2>
          <p>Period: ${report.period}</p>
        </div>
        
        <div class="content">
          <div class="summary">
            <h3>📊 Summary</h3>
            <p><strong>Total Students:</strong> ${report.summary.totalStudents}</p>
            <p><strong>Total Parades:</strong> ${report.summary.totalParades}</p>
            <p><strong>Average Attendance:</strong> ${report.summary.averageAttendance.toFixed(1)}%</p>
          </div>
          
          <h3>📋 Detailed Attendance Report</h3>
          <table>
            <thead>
              <tr>
                <th>Roll Number</th>
                <th>Regimental No.</th>
                <th>Name</th>
                <th>Category</th>
                <th>Rank</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Late</th>
                <th>Excused</th>
                <th>Attendance %</th>
              </tr>
            </thead>
            <tbody>
              ${studentsTable}
            </tbody>
          </table>
        </div>
        
        <div class="footer">
          <p>Generated by NCC Management System on ${new Date().toLocaleString()}</p>
          <p>This is an automated report. Please do not reply to this email.</p>
        </div>
      </body>
    </html>
  `;
};

// Get department email based on branch
const getDepartmentEmail = (branch) => {
  const departmentEmails = {
    'Computer Science & Engineering (CSE)': process.env.CSE_DEPT_EMAIL || 'cse@college.edu',
    'CSE – Artificial Intelligence & Machine Learning (AIML)': process.env.AIML_DEPT_EMAIL || 'aiml@college.edu',
    'CSE – Data Science (CS DS)': process.env.CSDS_DEPT_EMAIL || 'csds@college.edu',
    'Electronics & Communication Engineering (ECE)': process.env.ECE_DEPT_EMAIL || 'ece@college.edu',
    'Information Technology (IT)': process.env.IT_DEPT_EMAIL || 'it@college.edu',
    'Electrical & Electronics Engineering (EEE)': process.env.EEE_DEPT_EMAIL || 'eee@college.edu',
    'Mechanical Engineering (ME)': process.env.ME_DEPT_EMAIL || 'me@college.edu',
    'Civil Engineering (CE)': process.env.CE_DEPT_EMAIL || 'ce@college.edu'
  };
  
  return departmentEmails[branch] || 'admin@college.edu';
};

// Send weekly report email
export const sendWeeklyReport = async (branch) => {
  try {
    console.log(`📧 Generating weekly report for ${branch}...`);
    
    // Calculate last week dates
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    // Generate report
    const report = await generateWeeklyReport(branch, startDate, endDate);
    
    // Create email transporter
    const transporter = createTransporter();
    
    // Department email
    const departmentEmail = getDepartmentEmail(branch);
    
    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: departmentEmail,
      cc: process.env.ADMIN_EMAIL || process.env.ADMIN_1_EMAIL,
      subject: `📊 Weekly NCC Attendance Report - ${branch} (${startDate.toDateString()} to ${endDate.toDateString()})`,
      html: generateEmailHTML(report),
      attachments: [
        {
          filename: `weekly_attendance_${branch.replace(/[^a-zA-Z0-9]/g, '_')}_${startDate.toISOString().split('T')[0]}.json`,
          content: JSON.stringify(report, null, 2),
          contentType: 'application/json'
        }
      ]
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Weekly report sent successfully to ${departmentEmail}`);
    console.log('Message ID:', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId,
      recipientEmail: departmentEmail,
      branch,
      reportPeriod: `${startDate.toDateString()} to ${endDate.toDateString()}`
    };
    
  } catch (error) {
    console.error(`❌ Failed to send weekly report for ${branch}:`, error);
    throw error;
  }
};

// Send weekly reports for all branches
export const sendAllWeeklyReports = async () => {
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

  const results = [];
  
  for (const branch of branches) {
    try {
      const result = await sendWeeklyReport(branch);
      results.push(result);
    } catch (error) {
      results.push({
        success: false,
        branch,
        error: error.message
      });
    }
  }
  
  return results;
};

// Send daily parade report email at 5 PM
export const sendDailyParadeReport = async () => {
  try {
    console.log('📧 Checking for parades today...');
    
    // Get today's date
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    // Find parades scheduled for today
    const todaysParades = await Parade.find({
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    if (todaysParades.length === 0) {
      console.log('📅 No parades scheduled for today');
      return { success: true, message: 'No parades scheduled for today' };
    }

    console.log(`📊 Found ${todaysParades.length} parade(s) for today`);
    
    const results = [];
    
    for (const parade of todaysParades) {
      try {
        // Get attendance data for this parade
        const attendanceRecords = await Attendance.find({ parade: parade._id })
          .populate('student', 'name regimentalNumber rollNumber category branch rank email phone');
        
        // Group students by branch
        const branchGroups = {};
        const studentsByBranch = {};
        
        // Get all active students for each branch
        const allStudents = await Student.find({ isActive: true });
        
        allStudents.forEach(student => {
          if (!studentsByBranch[student.branch]) {
            studentsByBranch[student.branch] = [];
          }
          studentsByBranch[student.branch].push(student);
        });
        
        // Create attendance map for quick lookup
        const attendanceMap = {};
        attendanceRecords.forEach(record => {
          attendanceMap[record.student._id] = record;
        });
        
        // Generate report for each branch
        for (const [branch, students] of Object.entries(studentsByBranch)) {
          const branchReport = {
            parade: parade.name,
            date: today.toDateString(),
            branch,
            students: [],
            summary: {
              totalStudents: students.length,
              present: 0,
              absent: 0,
              late: 0,
              excused: 0,
              notMarked: 0
            }
          };
          
          students.forEach(student => {
            const attendance = attendanceMap[student._id];
            const status = attendance ? attendance.status : 'Not Marked';
            
            branchReport.students.push({
              name: student.name,
              regimentalNumber: student.regimentalNumber,
              rollNumber: student.rollNumber,
              category: student.category,
              rank: student.rank,
              status,
              remarks: attendance ? attendance.remarks : ''
            });
            
            // Count statistics
            if (status === 'Present') branchReport.summary.present++;
            else if (status === 'Absent') branchReport.summary.absent++;
            else if (status === 'Late') branchReport.summary.late++;
            else if (status === 'Excused') branchReport.summary.excused++;
            else branchReport.summary.notMarked++;
          });
          
          // Send email to department
          const result = await sendDailyParadeEmail(branchReport);
          results.push(result);
        }
        
      } catch (error) {
        console.error(`❌ Error processing parade ${parade.name}:`, error);
        results.push({
          success: false,
          parade: parade.name,
          error: error.message
        });
      }
    }
    
    return {
      success: true,
      message: `Daily parade reports sent for ${todaysParades.length} parade(s)`,
      results
    };
    
  } catch (error) {
    console.error('❌ Error in daily parade report:', error);
    throw error;
  }
};

// Helper function to send daily parade email for a specific branch
const sendDailyParadeEmail = async (report) => {
  try {
    const transporter = createTransporter();
    const departmentEmail = getDepartmentEmail(report.branch);
    
    const studentsTable = report.students.map(student => `
      <tr style="${student.status === 'Absent' ? 'background-color: #ffebee;' : student.status === 'Present' ? 'background-color: #e8f5e8;' : ''}">
        <td style="padding: 8px; border: 1px solid #ddd;">${student.rollNumber || 'N/A'}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${student.regimentalNumber}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${student.name}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${student.category}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${student.rank}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold;">
          <span style="color: ${
            student.status === 'Present' ? 'green' : 
            student.status === 'Absent' ? 'red' : 
            student.status === 'Late' ? 'orange' : 
            student.status === 'Excused' ? 'blue' : 'gray'
          };">${student.status}</span>
        </td>
        <td style="padding: 8px; border: 1px solid #ddd;">${student.remarks || ''}</td>
      </tr>
    `).join('');
    
    const attendanceRate = report.summary.totalStudents > 0 
      ? ((report.summary.present + report.summary.late) / report.summary.totalStudents * 100).toFixed(1)
      : 0;
    
    const emailHTML = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .header { background-color: #1a365d; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #2d3748; color: white; padding: 12px; text-align: left; border: 1px solid #ddd; }
            td { padding: 8px; border: 1px solid #ddd; }
            .summary { background-color: #f7fafc; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #3182ce; }
            .stats { display: flex; justify-content: space-around; margin: 15px 0; }
            .stat-box { text-align: center; padding: 10px; background: white; border-radius: 5px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .footer { text-align: center; margin-top: 30px; color: #718096; }
            .attendance-rate { font-size: 24px; font-weight: bold; color: ${attendanceRate >= 80 ? '#38a169' : attendanceRate >= 60 ? '#ed8936' : '#e53e3e'}; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎖️ Daily Parade Attendance Report</h1>
            <h2>${report.branch}</h2>
            <p>Parade: ${report.parade} | Date: ${report.date}</p>
          </div>
          
          <div class="content">
            <div class="summary">
              <h3>📊 Attendance Summary</h3>
              <div class="stats">
                <div class="stat-box">
                  <div style="font-size: 20px; font-weight: bold; color: #38a169;">${report.summary.present}</div>
                  <div>Present</div>
                </div>
                <div class="stat-box">
                  <div style="font-size: 20px; font-weight: bold; color: #e53e3e;">${report.summary.absent}</div>
                  <div>Absent</div>
                </div>
                <div class="stat-box">
                  <div style="font-size: 20px; font-weight: bold; color: #ed8936;">${report.summary.late}</div>
                  <div>Late</div>
                </div>
                <div class="stat-box">
                  <div style="font-size: 20px; font-weight: bold; color: #3182ce;">${report.summary.excused}</div>
                  <div>Excused</div>
                </div>
                <div class="stat-box">
                  <div style="font-size: 20px; font-weight: bold; color: #718096;">${report.summary.notMarked}</div>
                  <div>Not Marked</div>
                </div>
              </div>
              <div style="text-align: center; margin-top: 15px;">
                <div>Attendance Rate: <span class="attendance-rate">${attendanceRate}%</span></div>
                <div style="margin-top: 5px;">Total Students: ${report.summary.totalStudents}</div>
              </div>
            </div>
            
            <h3>📋 Detailed Attendance</h3>
            <table>
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Regimental No.</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Rank</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                ${studentsTable}
              </tbody>
            </table>
          </div>
          
          <div class="footer">
            <p>Generated by NCC Management System on ${new Date().toLocaleString()}</p>
            <p>This is an automated daily report. Please do not reply to this email.</p>
          </div>
        </body>
      </html>
    `;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: departmentEmail,
      cc: process.env.ADMIN_EMAIL || process.env.ADMIN_1_EMAIL,
      subject: `📊 Daily Parade Attendance - ${report.branch} - ${report.parade} (${report.date})`,
      html: emailHTML
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Daily parade report sent to ${report.branch}: ${departmentEmail}`);
    
    return {
      success: true,
      messageId: info.messageId,
      recipientEmail: departmentEmail,
      branch: report.branch,
      parade: report.parade,
      date: report.date
    };
    
  } catch (error) {
    console.error(`❌ Failed to send daily parade report for ${report.branch}:`, error);
    throw error;
  }
};

export default {
  sendWeeklyReport,
  sendAllWeeklyReports,
  sendDailyParadeReport
};
