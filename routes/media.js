const express   = require('express');
const router    = express.Router();
const mongoose  = require('mongoose');

const Media           = require('../models/Media');
const MediaDeletionLog = require('../models/MediaDeletionLog');
const auth       = require('../middlewares/authMiddleware');
const authAdmin  = require('../middlewares/authAdmin');

router.get('/',
  auth,
  authAdmin,
  async (req, res) => {
    try {
      const medias = await Media.find({ deleted: { $ne: true }  });
      return res.json(medias);
    } catch (err) {
      console.error('GET /media error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
);

router.get('/:id', auth, authAdmin , async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ message: 'Media not found (GET)' });
    }
    res.json(media);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id',
  auth,
  authAdmin ,
  async (req, res) => {
    const { id }     = req.params;
    const { reason } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    try {
      const media = await Media.findById(id);
      console.log('Media encontrada:', media);
      if (!media) {
        return res.status(404).json({ message: 'Media not found' });
      } else if (media.deleted === true) {
        return res.status(400).json({ message: 'Media is already deleted' });
      }

      // Implement logic here to remove the upload if needed (confirmar com matix)

      // 4) Grava o log de auditoria
      try {
        await MediaDeletionLog.create({
          mediaId:   id,
          deletedBy: req.user.id,
          reason:    reason || null,
          deletedAt: new Date()
        });
      } catch (logErr) {
        return res
          .status(500)
          .json({ message: 'Failed to create audit log', error: logErr.message });
      }

      // 5) Atualiza o documento media
      await Media.findByIdAndUpdate(
        id,
        {
          $set: {
            deleted:        true,
          }
        }
      );

      return res.json({ message: 'Media deleted and log recorded' });
    } catch (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
);

module.exports = router;