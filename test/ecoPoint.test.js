const EcoPoint = require('../models/EcoPoint');
const { createEcopointSchema } = require('../schemas/ecopointSchemas');

describe('EcoPoint Create Schema', () => {
  it('should reject payload with invalid longitude', () => {
    const invalidPayload = {
      name: 'EcoPoint hehe',
      address: 'Gurupi',
      coordinates: {
        coordinates: [-416.6333, -23.5505],
      },
      operatingHours: '08:00-18:00',
    };

    const result = createEcopointSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
    expect(result.error.issues.some(issue => issue.message === 'Longitude must be between -180 and 180')).toBe(true);
  });

  it('should accept payload with valid coordinates', () => {
    const validPayload = {
      name: 'EcoPoint Maddev',
      address: 'Brasilia',
      coordinates: {
        coordinates: [-46.6333, -23.5505],
      },
      operatingHours: '08:00-18:00',
    };

    const result = createEcopointSchema.safeParse(validPayload);

    expect(result.success).toBe(true);
  });
});

describe('EcoPoint Model', () => {
  it('should create a valid EcoPoint document', () => {
    const validEcoPoint = new EcoPoint({
      name: 'EcoPoint Centro',
      address: 'Beijodramo',
      coordinates: {
        type: 'Point',
        coordinates: [-46.6333, -23.5505],
      },
      acceptedMaterials: ['plastic', 'metal'],
      status: 'Open',
      operatingHours: '08:00-18:00',
      isActive: true,
    });

    const error = validEcoPoint.validateSync();

    expect(error).toBeUndefined();
    expect(validEcoPoint.name).toBe('EcoPoint Centro');
    expect(validEcoPoint.coordinates.type).toBe('Point');
  });

  it('should reject an invalid EcoPoint document', () => {
    const invalidEcoPoint = new EcoPoint({
      address: 'Rua sem nome',
      coordinates: {
        type: 'Point',
        coordinates: [-46.6333, -23.5505],
      },
      status: 'Unavailable',
    });

    const error = invalidEcoPoint.validateSync();

    expect(error).toBeDefined();
    expect(error.errors.name).toBeDefined();
    expect(error.errors.status).toBeDefined();
  });
});