import express from 'express';
import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import Parade from '../models/Parade.js';
import { authenticateToken } from './auth.js';
import { checkAuthorization, checkModifyPermission, checkReadPermission, checkSuperAdminPermission } from '../middleware/accessControl.js';

const router = express.Router();

// Get attendance for a specific parade with filtering (read-only access)
router.get('/parade/:paradeId/detailed', checkAuthorization, checkReadPermission, async (req, res) => {
  try {
    const { paradeId } = req.params;
    const { category, branch, status } = req.query;
    
    // Build student filter
    let studentFilter = {};
    if (category && category !== 'All') {
      studentFilter.category = category;
    }
    if (branch && branch !== 'All') {
      studentFilter.branch = branch;
    }
    
    // First get students matching the filter
    const students = await Student.find(studentFilter);
    const studentIds = students.map(s => s._id);
    
    // Get attendance records for these students for this parade
    let attendanceFilter = { parade: paradeId };
    if (studentIds.length > 0) {
      attendanceFilter.student = { $in: studentIds };
    }
    
    if (status && status !== 'All') {
      attendanceFilter.status = status;
    }
    
    const attendance = await Attendance.find(attendanceFilter)
      .populate('student', 'name regimentalNumber category branch rank email phone')
      .populate('markedBy', 'fullName username')
      .sort('student.name');
    
    // Also get parade details
    const parade = await Parade.findById(paradeId);
    
    // Get summary statistics for all filtered students
    const totalStudents = students.length;
    const presentStudents = attendance.filter(a => a.status === 'Present').length;
    const absentStudents = attendance.filter(a => a.status === 'Absent').length;
    const lateStudents = attendance.filter(a => a.status === 'Late').length;
    const notMarkedStudents = totalStudents - attendance.length;
    
    // Separate present students for easy display
    const presentAttendance = attendance.filter(a => a.status === 'Present');
    const absentAttendance = attendance.filter(a => a.status === 'Absent');
    const lateAttendance = attendance.filter(a => a.status === 'Late');
    
    res.json({
      parade,
      attendance: {
        all: attendance,
        present: presentAttendance,
        absent: absentAttendance,
        late: lateAttendance
      },
      summary: {
        total: totalStudents,
        present: presentStudents,
        absent: absentStudents,
        late: lateStudents,
        notMarked: notMarkedStudents,
        attendanceRate: totalStudents > 0 ? ((presentStudents + lateStudents) / totalStudents * 100).toFixed(1) : 0
      },
      filters: {
        category,
        branch,
        status
      }
    });
  } catch (error) {
    console.error('Error fetching detailed attendance:', error);
    res.status(500).json({ error: 'Failed to fetch detailed attendance' });
  }
});

// Get attendance for a specific parade (read-only access)
router.get('/parade/:paradeId', checkAuthorization, checkReadPermission, async (req, res) => {
  try {
    const { paradeId } = req.params;
    
    const attendance = await Attendance.find({ parade: paradeId })
      .populate('student', 'name rollNumber company year')
      .populate('markedBy', 'fullName username')
      .sort('student.name');
    
    res.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

// Get attendance for a specific student (read-only access)
router.get('/student/:studentId', checkAuthorization, checkReadPermission, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const attendance = await Attendance.find({ student: studentId })
      .populate('parade', 'name type date time')
      .populate('markedBy', 'fullName username')
      .sort('-parade.date');
    
    res.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

// Mark attendance for multiple students (requires modify permission)
router.post('/mark', checkAuthorization, checkModifyPermission, async (req, res) => {
  try {
    const { paradeId, attendanceData } = req.body;
    // attendanceData should be an array of { studentId, status, remarks }
    
    if (!paradeId || !Array.isArray(attendanceData)) {
      return res.status(400).json({ error: 'Invalid request data' });
    }
    
    const results = {
      updated: 0,
      created: 0,
      errors: []
    };
    
    for (const data of attendanceData) {
      try {
        const { studentId, status, remarks } = data;
        
        const existingAttendance = await Attendance.findOne({
          parade: paradeId,
          student: studentId
        });
        
        if (existingAttendance) {
          await Attendance.findByIdAndUpdate(existingAttendance._id, {
            status,
            remarks,
            markedBy: req.user.userId,
            markedAt: new Date()
          });
          results.updated++;
        } else {
          await Attendance.create({
            parade: paradeId,
            student: studentId,
            status,
            remarks,
            markedBy: req.user.userId
          });
          results.created++;
        }
      } catch (error) {
        results.errors.push(`Error marking attendance for student ${data.studentId}: ${error.message}`);
      }
    }
    
    // Update attendance rates for affected students
    const studentIds = attendanceData.map(data => data.studentId);
    await updateAttendanceRates(studentIds);
    
    res.json(results);
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
});

// Mark individual attendance (requires modify permission)
router.post('/', checkAuthorization, checkModifyPermission, async (req, res) => {
  try {
    const { paradeId, studentId, status, remarks } = req.body;
    
    // Check if attendance already exists
    const existingAttendance = await Attendance.findOne({
      parade: paradeId,
      student: studentId
    });
    
    if (existingAttendance) {
      // Update existing attendance
      const updatedAttendance = await Attendance.findByIdAndUpdate(
        existingAttendance._id,
        {
          status,
          remarks,
          markedBy: req.user.userId,
          markedAt: new Date()
        },
        { new: true }
      ).populate('student', 'name rollNumber company year')
       .populate('parade', 'name type date time')
       .populate('markedBy', 'fullName username');
      
      await updateAttendanceRates([studentId]);
      
      res.json(updatedAttendance);
    } else {
      // Create new attendance record
      const attendance = new Attendance({
        parade: paradeId,
        student: studentId,
        status,
        remarks,
        markedBy: req.user.userId
      });
      
      await attendance.save();
      await attendance.populate('student', 'name rollNumber company year');
      await attendance.populate('parade', 'name type date time');
      await attendance.populate('markedBy', 'fullName username');
      
      await updateAttendanceRates([studentId]);
      
      res.status(201).json(attendance);
    }
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
});

// Update attendance (requires modify permission)
router.put('/:id', checkAuthorization, checkModifyPermission, async (req, res) => {
  try {
    const { status, remarks } = req.body;
    
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      {
        status,
        remarks,
        markedBy: req.user.userId,
        markedAt: new Date()
      },
      { new: true }
    ).populate('student', 'name rollNumber company year')
     .populate('parade', 'name type date time')
     .populate('markedBy', 'fullName username');
    
    if (!attendance) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    
    await updateAttendanceRates([attendance.student._id]);
    
    res.json(attendance);
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ error: 'Failed to update attendance' });
  }
});

// Delete attendance (requires super admin permission)
router.delete('/:id', checkAuthorization, checkSuperAdminPermission, async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    
    if (!attendance) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    
    await updateAttendanceRates([attendance.student]);
    
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({ error: 'Failed to delete attendance' });
  }
});

// Helper function to update attendance rates
async function updateAttendanceRates(studentIds) {
  try {
    for (const studentId of studentIds) {
      const totalAttendance = await Attendance.countDocuments({ student: studentId });
      const presentAttendance = await Attendance.countDocuments({ 
        student: studentId, 
        status: 'Present' 
      });
      
      const attendanceRate = totalAttendance > 0 ? (presentAttendance / totalAttendance) * 100 : 0;
      
      await Student.findByIdAndUpdate(studentId, { attendanceRate });
    }
  } catch (error) {
    console.error('Error updating attendance rates:', error);
  }
}

export default router;
