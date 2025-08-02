import express from 'express';
import Student from '../models/Student.js';
import Parade from '../models/Parade.js';
import Attendance from '../models/Attendance.js';
import { authenticateToken } from './auth.js';
import { checkAuthorization, checkReadPermission } from '../middleware/accessControl.js';

const router = express.Router();

// Get dashboard statistics (read-only access)
router.get('/dashboard', checkAuthorization, checkReadPermission, async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments({ isActive: true });
    const totalParades = await Parade.countDocuments();
    const activeParades = await Parade.countDocuments({ 
      status: { $in: ['Upcoming', 'Ongoing'] } 
    });
    
    // Calculate average attendance rate
    const students = await Student.find({ isActive: true }, 'attendanceRate');
    const averageAttendance = students.length > 0 
      ? students.reduce((sum, student) => sum + student.attendanceRate, 0) / students.length 
      : 0;
    
    // Get recent activities
    const recentParades = await Parade.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('createdBy', 'fullName');
    
    const recentAttendance = await Attendance.find()
      .sort({ markedAt: -1 })
      .limit(10)
      .populate('student', 'name regimentalNumber')
      .populate('parade', 'name date')
      .populate('markedBy', 'fullName');
    
    res.json({
      totalStudents,
      totalParades,
      activeParades,
      averageAttendance: Math.round(averageAttendance * 10) / 10,
      recentParades,
      recentAttendance
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get attendance report
// Get attendance reports (read-only access)
router.get('/attendance', checkAuthorization, checkReadPermission, async (req, res) => {
  try {
    const { paradeId, category, startDate, endDate } = req.query;
    
    let studentQuery = { isActive: true };
    if (category) studentQuery.category = category;
    
    let paradeQuery = {};
    if (paradeId) paradeQuery._id = paradeId;
    if (startDate || endDate) {
      paradeQuery.date = {};
      if (startDate) paradeQuery.date.$gte = new Date(startDate);
      if (endDate) paradeQuery.date.$lte = new Date(endDate);
    }
    
    const students = await Student.find(studentQuery).sort({ name: 1 });
    const parades = await Parade.find(paradeQuery).sort({ date: -1 });
    
    const report = [];
    
    for (const student of students) {
      const studentReport = {
        student: {
          id: student._id,
          name: student.name,
          regimentalNumber: student.regimentalNumber,
          category: student.category,
          rank: student.rank,
          attendanceRate: student.attendanceRate
        },
        attendance: []
      };
      
      for (const parade of parades) {
        const attendance = await Attendance.findOne({
          student: student._id,
          parade: parade._id
        });
        
        studentReport.attendance.push({
          parade: {
            id: parade._id,
            name: parade.name,
            date: parade.date,
            type: parade.type
          },
          status: attendance ? attendance.status : 'Not Marked',
          remarks: attendance ? attendance.remarks : null,
          markedAt: attendance ? attendance.markedAt : null
        });
      }
      
      report.push(studentReport);
    }
    
    res.json({
      report,
      summary: {
        totalStudents: students.length,
        totalParades: parades.length,
        filters: { paradeId, category, startDate, endDate }
      }
    });
  } catch (error) {
    console.error('Error generating attendance report:', error);
    res.status(500).json({ error: 'Failed to generate attendance report' });
  }
});

// Get parade-wise attendance statistics
// Get parade statistics (read-only access)
router.get('/parade-stats', checkAuthorization, checkReadPermission, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let paradeQuery = {};
    if (startDate || endDate) {
      paradeQuery.date = {};
      if (startDate) paradeQuery.date.$gte = new Date(startDate);
      if (endDate) paradeQuery.date.$lte = new Date(endDate);
    }
    
    const parades = await Parade.find(paradeQuery).sort({ date: -1 });
    const totalStudents = await Student.countDocuments({ isActive: true });
    
    const stats = [];
    
    for (const parade of parades) {
      const attendanceStats = await Attendance.aggregate([
        { $match: { parade: parade._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);
      
      const statObj = {
        parade: {
          id: parade._id,
          name: parade.name,
          date: parade.date,
          type: parade.type
        },
        totalStudents,
        attendance: {
          Present: 0,
          Absent: 0,
          Late: 0,
          Excused: 0,
          'Not Marked': totalStudents
        }
      };
      
      let totalMarked = 0;
      attendanceStats.forEach(stat => {
        statObj.attendance[stat._id] = stat.count;
        totalMarked += stat.count;
      });
      
      statObj.attendance['Not Marked'] = totalStudents - totalMarked;
      statObj.attendancePercentage = totalStudents > 0 
        ? Math.round((statObj.attendance.Present / totalStudents) * 100 * 10) / 10 
        : 0;
      
      stats.push(statObj);
    }
    
    res.json(stats);
  } catch (error) {
    console.error('Error generating parade statistics:', error);
    res.status(500).json({ error: 'Failed to generate parade statistics' });
  }
});

// Get student-wise attendance statistics
// Get student statistics (read-only access)
router.get('/student-stats', checkAuthorization, checkReadPermission, async (req, res) => {
  try {
    const { category } = req.query;
    
    let studentQuery = { isActive: true };
    if (category) studentQuery.category = category;
    
    const students = await Student.find(studentQuery).sort({ attendanceRate: -1 });
    
    const stats = [];
    
    for (const student of students) {
      const attendanceStats = await Attendance.aggregate([
        { $match: { student: student._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);
      
      const statObj = {
        student: {
          id: student._id,
          name: student.name,
          rollNumber: student.rollNumber,
          company: student.company,
          year: student.year
        },
        attendance: {
          Present: 0,
          Absent: 0,
          Late: 0,
          Excused: 0
        },
        attendanceRate: student.attendanceRate
      };
      
      attendanceStats.forEach(stat => {
        statObj.attendance[stat._id] = stat.count;
      });
      
      statObj.totalParades = Object.values(statObj.attendance).reduce((sum, count) => sum + count, 0);
      
      stats.push(statObj);
    }
    
    res.json(stats);
  } catch (error) {
    console.error('Error generating student statistics:', error);
    res.status(500).json({ error: 'Failed to generate student statistics' });
  }
});

// Export attendance report as CSV
// Export attendance data (read-only access)
router.get('/export/attendance', checkAuthorization, checkReadPermission, async (req, res) => {
  try {
    const { paradeId, category, startDate, endDate } = req.query;
    
    let studentQuery = { isActive: true };
    if (category) studentQuery.category = category;
    
    let paradeQuery = {};
    if (paradeId) paradeQuery._id = paradeId;
    if (startDate || endDate) {
      paradeQuery.date = {};
      if (startDate) paradeQuery.date.$gte = new Date(startDate);
      if (endDate) paradeQuery.date.$lte = new Date(endDate);
    }
    
    const students = await Student.find(studentQuery).sort({ name: 1 });
    const parades = await Parade.find(paradeQuery).sort({ date: 1 });
    
    // Create CSV header
    let csvData = 'S.No,Name,Regimental Number,Category,Rank';
    
    if (paradeId) {
      const parade = parades[0];
      csvData += `,${parade.name} (${parade.date.toDateString()}) Attendance,Remarks\n`;
    } else {
      parades.forEach(parade => {
        csvData += `,${parade.name} (${parade.date.toDateString().split(' ').slice(1, 3).join(' ')})`;
      });
      csvData += ',Overall Attendance Rate\n';
    }
    
    // Add student data
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      csvData += `${i + 1},"${student.name}","${student.regimentalNumber}","${student.category}","${student.rank}"`;
      
      if (paradeId) {
        const attendance = await Attendance.findOne({
          student: student._id,
          parade: paradeId
        });
        csvData += `,"${attendance ? attendance.status : 'Not Marked'}","${attendance ? (attendance.remarks || '') : ''}"`;
      } else {
        for (const parade of parades) {
          const attendance = await Attendance.findOne({
            student: student._id,
            parade: parade._id
          });
          csvData += `,"${attendance ? attendance.status : 'Not Marked'}"`;
        }
        csvData += `,"${student.attendanceRate.toFixed(1)}%"`;
      }
      
      csvData += '\n';
    }
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="ncc_attendance_report_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvData);
    
  } catch (error) {
    console.error('Error exporting attendance report:', error);
    res.status(500).json({ error: 'Failed to export attendance report' });
  }
});

export default router;
