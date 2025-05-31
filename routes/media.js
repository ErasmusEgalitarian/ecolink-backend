const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const upload = require('../config/multer');
const Media = require('../models/Media');
const authMiddleware = require('../middlewares/authMiddleware');

const uploadDir = path.join(__dirname, '..', 'uploads');

// TODO: lidar com diferentes tipos de arquivos

router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  const { category } = req.body;

  if (!req.file) return res.status(400).send('Arquivo não enviado');

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
  const { category, date, page = 1, limit = 10 } = req.query;

  const filters = {};
  if (category) filters.category = category;
  if (date) filters.uploadedAt = { $gte: new Date(date) };

  try {
    const mediasFromDB = await Media.find(filters)
    .skip((page - 1) * limit)
    .limit(Number(limit));

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
    res.status(500).json({ message: 'Erro ao buscar mídias' });
  }
});


const categories = ['Coleta', 'Armazenamento', 'Visita']; 

router.get('/categories', (req, res) => {
  res.json(categories);
});

module.exports = router;