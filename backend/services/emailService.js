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

export default {
  sendWeeklyReport,
  sendAllWeeklyReports
};
