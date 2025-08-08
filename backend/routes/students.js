import express from 'express';
import Student from '../models/Student.js';
import { authenticateToken } from './auth.js';
import { checkAuthorization, checkModifyPermission, checkReadPermission, checkSuperAdminPermission } from '../middleware/accessControl.js';
import multer from 'multer';
import XLSX from 'xlsx';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Get all students (read-only access)
router.get('/', checkAuthorization, checkReadPermission, async (req, res) => {
  try {
    const { category, branch, search } = req.query;
    
    let query = { isActive: true };
    
    if (category) query.category = category;
    if (branch) query.branch = branch;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { regimentalNumber: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
        { rank: { $regex: search, $options: 'i' } },
        { branch: { $regex: search, $options: 'i' } }
      ];
    }
    
    const students = await Student.find(query).sort({ name: 1 });
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Get available branches for filtering
router.get('/filters/branches', checkAuthorization, checkReadPermission, async (req, res) => {
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

// Get student by ID (read-only access)
router.get('/:id', checkAuthorization, checkReadPermission, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

// Create new student (requires modify permission)
router.post('/', checkAuthorization, checkModifyPermission, async (req, res) => {
  try {
    const { name, regimentalNumber, rollNumber, category, branch, rank, email, phone, address, dateOfBirth } = req.body;
    
    // Check if regimental number already exists
    const existingStudent = await Student.findOne({ regimentalNumber });
    if (existingStudent) {
      return res.status(400).json({ error: 'Regimental number already exists' });
    }
    
    // Check if roll number already exists
    const existingRollNumber = await Student.findOne({ rollNumber });
    if (existingRollNumber) {
      return res.status(400).json({ error: 'Roll number already exists' });
    }
    
    const student = new Student({
      name,
      regimentalNumber: regimentalNumber.toUpperCase(),
      rollNumber: rollNumber.toUpperCase(),
      category,
      branch,
      rank,
      email,
      phone,
      address,
      dateOfBirth
    });
    
    await student.save();
    res.status(201).json(student);
  } catch (error) {
    console.error('Error creating student:', error);
    if (error.code === 11000) {
      res.status(400).json({ error: 'Regimental number already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create student' });
    }
  }
});

// Update student (requires modify permission)
router.put('/:id', checkAuthorization, checkModifyPermission, async (req, res) => {
  try {
    const { name, regimentalNumber, rollNumber, category, branch, rank, email, phone, address, dateOfBirth } = req.body;
    
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      {
        name,
        regimentalNumber: regimentalNumber?.toUpperCase(),
        rollNumber: rollNumber?.toUpperCase(),
        category,
        branch,
        rank,
        email,
        phone,
        address,
        dateOfBirth
      },
      { new: true, runValidators: true }
    );
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json(student);
  } catch (error) {
    console.error('Error updating student:', error);
    if (error.code === 11000) {
      res.status(400).json({ error: 'Regimental number already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update student' });
    }
  }
});

// Delete student (requires super admin permission)
router.delete('/:id', checkAuthorization, checkSuperAdminPermission, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

// Bulk upload students via Excel (requires modify permission)
router.post('/upload', checkAuthorization, checkModifyPermission, upload.single('excel'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    const results = {
      added: 0,
      duplicates: 0,
      errors: []
    };
    
    for (const row of jsonData) {
      try {
        const regimentalNumber = (row['Regimental Number'] || row['RegimentalNumber'] || row['regimental_number'] || '').toString().toUpperCase();
        const name = row['Name'] || row['Student Name'] || row['name'] || '';
        const category = row['Category'] || row['category'] || '';
        const rank = row['Rank'] || row['rank'] || '';
        const email = row['Email'] || row['email'] || '';
        const phone = row['Phone'] || row['phone'] || '';
        const address = row['Address'] || row['address'] || '';
        
        if (!name || !regimentalNumber || !category || !rank || !address) {
          results.errors.push(`Row skipped: Missing required fields - Name: ${name}, Regimental Number: ${regimentalNumber}, Category: ${category}, Rank: ${rank}, Address: ${address}`);
          continue;
        }
        
        // Check if student already exists
        const existingStudent = await Student.findOne({ regimentalNumber });
        if (existingStudent) {
          results.duplicates++;
          continue;
        }
        
        const student = new Student({
          name,
          regimentalNumber,
          category,
          rank,
          email,
          phone,
          address
        });
        
        await student.save();
        results.added++;
        
      } catch (error) {
        results.errors.push(`Error processing row: ${error.message}`);
      }
    }
    
    res.json(results);
  } catch (error) {
    console.error('Error processing Excel upload:', error);
    res.status(500).json({ error: 'Failed to process Excel file' });
  }
});

export default router;
