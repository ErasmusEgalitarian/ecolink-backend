const Location = require('../models/Location');
const EcoPoint = require('../models/EcoPoint');
const { createLocationSchema } = require('../schemas/locationSchemas');
const { createEcopointSchema } = require('../schemas/ecopointSchemas');
const {
    unionMaterials,
    deriveLocationStatus,
    enrichLocationWithEcopoints,
    sortEcopointsByStatus
} = require('../utils/locationHelpers');
const { normalizeQrCodeFromScan } = require('../utils/qrCodeHelpers');
const { qrCodeParamSchema } = require('../schemas/ecopointSchemas');

describe('Location Create Schema', () => {
    it('should reject payload with invalid longitude', () => {
        const invalidPayload = {
            name: 'BCE - Biblioteca Central',
            address: 'Campus Universitário Darcy Ribeiro',
            coordinates: {
                coordinates: [-416.6333, -23.5505]
            }
        };

        const result = createLocationSchema.safeParse(invalidPayload);
        expect(result.success).toBe(false);
        expect(result.error.issues.some(issue => issue.message === 'Longitude must be between -180 and 180')).toBe(true);
    });

    it('should accept payload with valid coordinates', () => {
        const validPayload = {
            name: 'BCE - Biblioteca Central',
            address: 'Campus Universitário Darcy Ribeiro',
            coordinates: {
                coordinates: [-47.8702, -15.7634]
            }
        };

        const result = createLocationSchema.safeParse(validPayload);
        expect(result.success).toBe(true);
    });
});

describe('Location Model', () => {
    it('should create a valid Location document', () => {
        const validLocation = new Location({
            name: 'BCE - Biblioteca Central',
            address: 'Campus Universitário Darcy Ribeiro',
            coordinates: {
                type: 'Point',
                coordinates: [-47.8702, -15.7634]
            }
        });

        const error = validLocation.validateSync();

        expect(error).toBeUndefined();
        expect(validLocation.name).toBe('BCE - Biblioteca Central');
        expect(validLocation.coordinates.type).toBe('Point');
    });
});

describe('EcoPoint Create Schema', () => {
    it('should accept payload with valid ecopoint data', () => {
        const validPayload = {
            locationId: '507f1f77bcf86cd799439011',
            label: 'Caixa entrada principal',
            acceptedMaterials: ['paper', 'metal', 'glass'],
            status: 'open'
        };

        const result = createEcopointSchema.safeParse(validPayload);
        expect(result.success).toBe(true);
    });
});

describe('EcoPoint Model', () => {
    it('should create a valid EcoPoint document', () => {
        const validEcoPoint = new EcoPoint({
            locationId: '507f1f77bcf86cd799439011',
            label: 'Caixa entrada principal',
            acceptedMaterials: ['plastic', 'metal'],
            status: 'open'
        });

        const error = validEcoPoint.validateSync();

        expect(error).toBeUndefined();
        expect(validEcoPoint.label).toBe('Caixa entrada principal');
    });

    it('should reject an invalid EcoPoint document', () => {
        const invalidEcoPoint = new EcoPoint({
            locationId: '507f1f77bcf86cd799439011',
            acceptedMaterials: ['plastic'],
            status: 'Unavailable'
        });

        const error = invalidEcoPoint.validateSync();

        expect(error).toBeDefined();
        expect(error.errors.label).toBeDefined();
        expect(error.errors.status).toBeDefined();
    });
});

describe('locationHelpers', () => {
    it('should union accepted materials from ecopoints', () => {
        const materials = unionMaterials([
            { acceptedMaterials: ['paper', 'metal'] },
            { acceptedMaterials: ['plastic', 'paper'] }
        ]);

        expect(materials).toEqual(['plastic', 'metal', 'paper']);
    });

    it('should derive open when any ecopoint is open', () => {
        expect(deriveLocationStatus([
            { status: 'full' },
            { status: 'open' }
        ])).toBe('open');
    });

    it('should derive full when no ecopoint is open', () => {
        expect(deriveLocationStatus([
            { status: 'full' },
            { status: 'closed' }
        ])).toBe('full');
    });

    it('should derive offline when all ecopoints are offline', () => {
        expect(deriveLocationStatus([
            { status: 'offline' },
            { status: 'offline' }
        ])).toBe('offline');
    });

    it('should sort ecopoints with offline last', () => {
        const sorted = sortEcopointsByStatus([
            { label: 'offline', status: 'offline' },
            { label: 'full', status: 'full' },
            { label: 'open', status: 'open' },
            { label: 'closed', status: 'closed' }
        ]);

        expect(sorted.map((ecopoint) => ecopoint.status)).toEqual([
            'open',
            'full',
            'closed',
            'offline'
        ]);
    });

    it('should enrich location with ecopoints summary', () => {
        const location = {
            _id: '507f1f77bcf86cd799439011',
            name: 'BCE - Biblioteca Central'
        };
        const ecopoints = [
            { acceptedMaterials: ['paper'], status: 'full' },
            { acceptedMaterials: ['plastic'], status: 'open' }
        ];

        const enriched = enrichLocationWithEcopoints(location, ecopoints);

        expect(enriched.status).toBe('open');
        expect(enriched.acceptedMaterials).toEqual(['plastic', 'paper']);
        expect(enriched.ecopoints).toHaveLength(2);
        expect(enriched.ecopoints[0].status).toBe('open');
        expect(enriched.ecopoints[1].status).toBe('full');
    });
});

describe('qrCodeParamSchema', () => {
    it('should accept a non-empty qr code', () => {
        const result = qrCodeParamSchema.safeParse({ qrCode: 'demo-ecolink' });
        expect(result.success).toBe(true);
    });

    it('should reject an empty qr code', () => {
        const result = qrCodeParamSchema.safeParse({ qrCode: '   ' });
        expect(result.success).toBe(false);
    });
});

describe('normalizeQrCodeFromScan', () => {
    it('should return plain qr codes unchanged', () => {
        expect(normalizeQrCodeFromScan('bce-plastic')).toBe('bce-plastic');
    });

    it('should extract qr code from query parameter q', () => {
        expect(
            normalizeQrCodeFromScan('https://app.ecolink.com/doacoes/scanner?q=demo-ecolink')
        ).toBe('demo-ecolink');
    });

    it('should extract qr code from query parameter qrCode', () => {
        expect(
            normalizeQrCodeFromScan('https://app.ecolink.com/scanner?qrCode=icc-main')
        ).toBe('icc-main');
    });

    it('should extract qr code from the last URL path segment', () => {
        expect(
            normalizeQrCodeFromScan('https://app.ecolink.com/doacoes/scanner/bce-plastic')
        ).toBe('bce-plastic');
    });

    it('should trim whitespace from plain codes', () => {
        expect(normalizeQrCodeFromScan('  icc-main  ')).toBe('icc-main');
    });
});
