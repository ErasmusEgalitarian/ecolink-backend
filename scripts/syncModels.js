require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = require('../config/db');

const models = [
  require('../models/User'),
  require('../models/Role'),
  require('../models/Donation'),
  require('../models/Media'),
  require('../models/Pickup'),
  require('../models/EcoPoint'),
];

async function syncModels() {
  try {
    await connectDB();

    for (const model of models) {
      try {
        await model.createCollection();
      } catch (error) {
        // Ignore collection already exists and move on.
        if (error && error.codeName !== 'NamespaceExists') {
          throw error;
        }
      }

      const droppedIndexes = await model.syncIndexes();
      console.log(`[sync] ${model.collection.collectionName} -> dropped: ${JSON.stringify(droppedIndexes)}`);
    }

    console.log('[sync] Models and indexes synchronized successfully.');
  } catch (error) {
    console.error('[sync] Failed to synchronize models:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

syncModels();
