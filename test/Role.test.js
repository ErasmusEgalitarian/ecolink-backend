
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const request = require('supertest');
const app = require('../server'); 

const mongoose = require('mongoose');

describe('GET /roles', () => {
  let authToken;
  let adminUser;
  let server;

  beforeAll(async () => {
    server = app.listen(0);
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });

    adminUser = await User.find( new mongoose.Types.ObjectId('6836081382cf7e288f7ca468')) // Admin user

    authToken = jwt.sign(
      { id: adminUser._id, username: adminUser.username, email: adminUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await server.close();
    await mongoose.disconnect();
    
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  it('must return all predefined roles', async () => {
    const response = await request(app)
      .get('/api/roles')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Admin' }),
        expect.objectContaining({ name: 'Editor' }),
        expect.objectContaining({ name: 'Viewer' })
      ])
    );
  });

  it('must return exactly 3 roles', async () => {
    const response = await request(app)
      .get('/api/roles')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.length).toBe(3);
  });
});