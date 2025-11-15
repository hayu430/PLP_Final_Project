const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Ewaste = require('../models/Ewaste');
const Center = require('../models/Center');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

router.post('/submit', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const { name, category, condition, location, description } = req.body;

    if (!name || !category || !condition || !location) {
      return res.status(400).json({ error: 'All required fields must be filled' });
    }

    const itemData = {
      user_id: req.session.userId,
      name,
      category,
      condition,
      location,
      description: description || '',
      image: req.file ? `/uploads/${req.file.filename}` : '',
      status: 'Pending'
    };

    const item = await Ewaste.create(itemData);
    res.status(201).json({ message: 'E-waste item submitted successfully', item });
  } catch (error) {
    console.error('Submit error:', error);
    res.status(500).json({ error: 'Failed to submit item' });
  }
});

router.get('/my-items', requireAuth, async (req, res) => {
  try {
    const items = await Ewaste.findByUserId(req.session.userId);
    res.json(items);
  } catch (error) {
    console.error('Fetch items error:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

router.get('/item/:id', requireAuth, async (req, res) => {
  try {
    const item = await Ewaste.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (item.user_id !== req.session.userId && req.session.userRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(item);
  } catch (error) {
    console.error('Fetch item error:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

router.put('/item/:id', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const item = await Ewaste.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (item.user_id !== req.session.userId && req.session.userRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (item.status !== 'Pending' && req.session.userRole !== 'admin') {
      return res.status(400).json({ error: 'Cannot edit items that are already collected or recycled' });
    }

    const updates = {
      name: req.body.name || item.name,
      category: req.body.category || item.category,
      condition: req.body.condition || item.condition,
      location: req.body.location || item.location,
      description: req.body.description !== undefined ? req.body.description : item.description
    };

    if (req.file) {
      updates.image = `/uploads/${req.file.filename}`;
    }

    const updatedItem = await Ewaste.update(req.params.id, updates);
    res.json({ message: 'Item updated successfully', item: updatedItem });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

router.delete('/item/:id', requireAuth, async (req, res) => {
  try {
    const item = await Ewaste.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (item.user_id !== req.session.userId && req.session.userRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (item.status !== 'Pending' && req.session.userRole !== 'admin') {
      return res.status(400).json({ error: 'Cannot delete items that are already collected or recycled' });
    }

    await Ewaste.delete(req.params.id);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

router.get('/centers', async (req, res) => {
  try {
    const centers = await Center.getAll();
    res.json(centers);
  } catch (error) {
    console.error('Fetch centers error:', error);
    res.status(500).json({ error: 'Failed to fetch centers' });
  }
});

module.exports = router;
