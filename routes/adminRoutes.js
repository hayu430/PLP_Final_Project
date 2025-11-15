const express = require('express');
const router = express.Router();
const Ewaste = require('../models/Ewaste');
const User = require('../models/User');
const Center = require('../models/Center');

const requireAdmin = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (req.session.userRole !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const totalItems = await Ewaste.getTotalCount();
    const statusStats = await Ewaste.getStatsByStatus();
    const categoryStats = await Ewaste.getStatsByCategory();
    const allUsers = await User.getAll();

    const stats = {
      totalItems,
      statusStats,
      categoryStats,
      activeUsers: allUsers.length,
      totalPoints: allUsers.reduce((sum, user) => sum + user.points, 0)
    };

    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

router.get('/items', requireAdmin, async (req, res) => {
  try {
    const items = await Ewaste.getAll();
    res.json(items);
  } catch (error) {
    console.error('Fetch items error:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

router.put('/item/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Pending', 'Collected', 'Recycled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const item = await Ewaste.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const oldStatus = item.status;
    const updatedItem = await Ewaste.update(req.params.id, { status });

    if (status === 'Recycled' && oldStatus !== 'Recycled') {
      await User.updatePoints(item.user_id, 10);
    }

    res.json({ message: 'Status updated successfully', item: updatedItem });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

router.get('/users', requireAdmin, async (req, res) => {
  try {
    const users = await User.getAll();
    res.json(users);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.post('/centers', requireAdmin, async (req, res) => {
  try {
    const { name, address, contact } = req.body;

    if (!name || !address || !contact) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const center = await Center.create({ name, address, contact });
    res.status(201).json({ message: 'Center added successfully', center });
  } catch (error) {
    console.error('Create center error:', error);
    res.status(500).json({ error: 'Failed to create center' });
  }
});

router.put('/centers/:id', requireAdmin, async (req, res) => {
  try {
    const { name, address, contact } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (address) updates.address = address;
    if (contact) updates.contact = contact;

    const center = await Center.update(req.params.id, updates);
    res.json({ message: 'Center updated successfully', center });
  } catch (error) {
    console.error('Update center error:', error);
    res.status(500).json({ error: 'Failed to update center' });
  }
});

router.delete('/centers/:id', requireAdmin, async (req, res) => {
  try {
    await Center.delete(req.params.id);
    res.json({ message: 'Center deleted successfully' });
  } catch (error) {
    console.error('Delete center error:', error);
    res.status(500).json({ error: 'Failed to delete center' });
  }
});

module.exports = router;
