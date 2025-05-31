const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const upload = require('../config/multer');
const Media = require('../models/Media');
const authMiddleware = require('../middlewares/authMiddleware');

const uploadDir = path.join(__dirname, '..', 'uploads');

// TODO: handle additional file types (e.g., video, audio, PDFs) based on MIME
// TODO: implement pagination with page & limit query params
// TODO: allow dynamic update of media (e.g., edit category, delete, rename)

router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  const { category } = req.body;

  if (!req.file) return res.status(400).send('File not sent');

  const media = new Media({
    filename: req.file.filename,
    path: req.file.path,
    type: req.file.mimetype,
    category
  });

  await media.save();
  res.status(201).json(media);
});

router.get('/', authMiddleware, async (req, res) => {
  const { category, date } = req.query;

  const filters = {};
  if (category) filters.category = category;
  if (date) filters.uploadedAt = { $gte: new Date(date) };

  try {
    const mediasFromDB = await Media.find(filters).sort({ uploadedAt: -1 });

    const filesOnDisk = fs.readdirSync(uploadDir);

    const filteredMedias = mediasFromDB
    .filter(media => filesOnDisk.includes(media.filename))
    .map(media => ({
        ...media.toObject(),
        url: `${req.protocol}://${req.get('host')}/uploads/${media.filename}`
    }));

    res.json(filteredMedias);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching files' });
  }
});


const categories = ['Collect', 'Storage', 'Visit']; 

router.get('/categories', (req, res) => {
  res.json(categories);
});

module.exports = router;