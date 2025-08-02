import express from 'express';
import Parade from '../models/Parade.js';
import { authenticateToken } from './auth.js';
import { checkAuthorization, checkModifyPermission, checkReadPermission, checkSuperAdminPermission } from '../middleware/accessControl.js';

const router = express.Router();

// Get all parades (read-only access)
router.get('/', checkAuthorization, checkReadPermission, async (req, res) => {
  try {
    const { status, type, startDate, endDate } = req.query;
    
    let query = {};
    
    if (status) query.status = status;
    if (type) query.type = type;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const parades = await Parade.find(query)
      .populate('createdBy', 'fullName username')
      .sort({ date: -1 });
    
    res.json(parades);
  } catch (error) {
    console.error('Error fetching parades:', error);
    res.status(500).json({ error: 'Failed to fetch parades' });
  }
});

// Get parade by ID (read-only access)
router.get('/:id', checkAuthorization, checkReadPermission, async (req, res) => {
  try {
    const parade = await Parade.findById(req.params.id)
      .populate('createdBy', 'fullName username');
    
    if (!parade) {
      return res.status(404).json({ error: 'Parade not found' });
    }
    
    res.json(parade);
  } catch (error) {
    console.error('Error fetching parade:', error);
    res.status(500).json({ error: 'Failed to fetch parade' });
  }
});

// Create new parade (requires modify permission)
router.post('/', checkAuthorization, checkModifyPermission, async (req, res) => {
  try {
    const {
      name,
      type,
      date,
      time,
      description,
      location,
      instructor,
      maxParticipants,
      requirements
    } = req.body;
    
    const parade = new Parade({
      name,
      type,
      date,
      time,
      description,
      location,
      instructor,
      maxParticipants,
      requirements,
      createdBy: req.user.userId
    });
    
    await parade.save();
    await parade.populate('createdBy', 'fullName username');
    
    res.status(201).json(parade);
  } catch (error) {
    console.error('Error creating parade:', error);
    res.status(500).json({ error: 'Failed to create parade' });
  }
});

// Update parade (requires modify permission)
router.put('/:id', checkAuthorization, checkModifyPermission, async (req, res) => {
  try {
    const {
      name,
      type,
      date,
      time,
      description,
      location,
      instructor,
      maxParticipants,
      requirements,
      status
    } = req.body;
    
    const parade = await Parade.findByIdAndUpdate(
      req.params.id,
      {
        name,
        type,
        date,
        time,
        description,
        location,
        instructor,
        maxParticipants,
        requirements,
        status
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'fullName username');
    
    if (!parade) {
      return res.status(404).json({ error: 'Parade not found' });
    }
    
    res.json(parade);
  } catch (error) {
    console.error('Error updating parade:', error);
    res.status(500).json({ error: 'Failed to update parade' });
  }
});

// Delete parade (requires super admin permission)
router.delete('/:id', checkAuthorization, checkSuperAdminPermission, async (req, res) => {
  try {
    const parade = await Parade.findByIdAndDelete(req.params.id);
    
    if (!parade) {
      return res.status(404).json({ error: 'Parade not found' });
    }
    
    res.json({ message: 'Parade deleted successfully' });
  } catch (error) {
    console.error('Error deleting parade:', error);
    res.status(500).json({ error: 'Failed to delete parade' });
  }
});

// Update parade status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    
    const parade = await Parade.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('createdBy', 'fullName username');
    
    if (!parade) {
      return res.status(404).json({ error: 'Parade not found' });
    }
    
    res.json(parade);
  } catch (error) {
    console.error('Error updating parade status:', error);
    res.status(500).json({ error: 'Failed to update parade status' });
  }
});

export default router;
