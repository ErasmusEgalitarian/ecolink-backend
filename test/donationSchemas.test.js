const validate = require('../middlewares/validate');
const { createDonationSchema, updateDonationSchema } = require('../schemas/donationSchemas');

// Mock Express request, response, and next
const mockRequest = (body = {}) => ({
    body
});

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockNext = jest.fn();

// Change the ecopointId when the Ecopoint model is available
describe('Donation Schema Validation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Create Donation Schema - Success Cases', () => {
        it('should successfully validate valid donation data with all required fields', () => {
            const validDonation = {
                ecopointId: '1',
                materialType: 'plastic',
                description: 'Clean plastic bottles',
                qtdMaterial: 10
            };

            const req = mockRequest(validDonation);
            const res = mockResponse();
            const middleware = validate(createDonationSchema);

            middleware(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should successfully validate donation without optional description', () => {
            const validDonation = {
                ecopointId: '1',
                materialType: 'glass',
                qtdMaterial: 5
            };

            const req = mockRequest(validDonation);
            const res = mockResponse();
            const middleware = validate(createDonationSchema);

            middleware(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(req.body.description).toBe(''); // Default value
        });

        it('should trim whitespace from ecopointId', () => {
            const validDonation = {
                ecopointId: '  1  ',
                materialType: 'metal',
                qtdMaterial: 3
            };

            const req = mockRequest(validDonation);
            const res = mockResponse();
            const middleware = validate(createDonationSchema);

            middleware(req, res, mockNext);

            expect(req.body.ecopointId).toBe('1');
            expect(req.body.materialType).toBe('metal');
            expect(mockNext).toHaveBeenCalledTimes(1);
        });

        it('should validate with all material types', () => {
            const materialTypes = ['plastic', 'metal', 'glass', 'paper'];
            
            materialTypes.forEach(type => {
                const validDonation = {
                    ecopointId: '1',
                    materialType: type,
                    qtdMaterial: 5
                };

                const req = mockRequest(validDonation);
                const res = mockResponse();
                const middleware = validate(createDonationSchema);

                middleware(req, res, mockNext);

                expect(mockNext).toHaveBeenCalled();
            });
        });
    });

    describe('Update Donation Schema - Success Cases', () => {
        it('should successfully validate update with single field', () => {
            const updateData = {
                materialType: 'plastic'
            };

            const req = mockRequest(updateData);
            const res = mockResponse();
            const middleware = validate(updateDonationSchema);

            middleware(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledTimes(1);
        });

        it('should successfully validate update with multiple fields', () => {
            const updateData = {
                materialType: 'metal',
                description: 'Recycled aluminum cans',
                qtdMaterial: 15
            };

            const req = mockRequest(updateData);
            const res = mockResponse();
            const middleware = validate(updateDonationSchema);

            middleware(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledTimes(1);
        });
    });

    describe('BVA - EcopointId Validation', () => {
        it('should reject empty ecopointId', () => {
            const invalidDonation = {
                ecopointId: '',
                materialType: 'plastic',
                qtdMaterial: 5
            };

            const req = mockRequest(invalidDonation);
            const res = mockResponse();
            const middleware = validate(createDonationSchema);

            middleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Validation error',
                errors: expect.arrayContaining([
                    expect.objectContaining({
                        field: 'ecopointId',
                        message: 'Ecopoint ID cannot be empty'
                    })
                ])
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should reject when ecopointId is missing', () => {
            const invalidDonation = {
                materialType: 'glass',
                qtdMaterial: 5
            };

            const req = mockRequest(invalidDonation);
            const res = mockResponse();
            const middleware = validate(createDonationSchema);

            middleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Validation error',
                errors: expect.arrayContaining([
                    expect.objectContaining({
                        field: 'ecopointId',
                        message: expect.stringMatching(/Ecopoint ID is required|expected string, received undefined/)
                    })
                ])
            });
            expect(mockNext).not.toHaveBeenCalled();
        });
    });

    describe('BVA - MaterialType Validation', () => {
        it('should reject invalid materialType', () => {
            const invalidDonation = {
                ecopointId: '1',
                materialType: 'wood',
                qtdMaterial: 5
            };

            const req = mockRequest(invalidDonation);
            const res = mockResponse();
            const middleware = validate(createDonationSchema);

            middleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Validation error',
                errors: expect.arrayContaining([
                    expect.objectContaining({
                        field: 'materialType',
                        message: expect.stringMatching(/Invalid option|expected one of/)
                    })
                ])
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should accept all valid material types', () => {
            const validTypes = ['plastic', 'metal', 'glass', 'paper'];
            
            validTypes.forEach(type => {
                const validDonation = {
                    ecopointId: '1',
                    materialType: type,
                    qtdMaterial: 5
                };

                const req = mockRequest(validDonation);
                const res = mockResponse();
                const middleware = validate(createDonationSchema);

                middleware(req, res, mockNext);

                expect(mockNext).toHaveBeenCalled();
            });
        });

        it('should reject when materialType is missing', () => {
            const invalidDonation = {
                ecopointId: '1',
                qtdMaterial: 5
            };

            const req = mockRequest(invalidDonation);
            const res = mockResponse();
            const middleware = validate(createDonationSchema);

            middleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Validation error',
                errors: expect.arrayContaining([
                    expect.objectContaining({
                        field: 'materialType',
                        message: expect.stringMatching(/Material type is required|expected/)
                    })
                ])
            });
            expect(mockNext).not.toHaveBeenCalled();
        });
    });

    describe('BVA - Quantity (qtdMaterial) Validation', () => {
        it('should reject when quantity is missing', () => {
            const invalidDonation = {
                ecopointId: '1',
                materialType: 'plastic'
            };

            const req = mockRequest(invalidDonation);
            const res = mockResponse();
            const middleware = validate(createDonationSchema);

            middleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Validation error',
                errors: expect.arrayContaining([
                    expect.objectContaining({
                        field: 'qtdMaterial',
                        message: expect.stringMatching(/Quantity is required|expected number, received undefined/)
                    })
                ])
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should reject when quantity is not a number', () => {
            const invalidDonation = {
                ecopointId: '1',
                materialType: 'glass',
                qtdMaterial: 'ten'
            };

            const req = mockRequest(invalidDonation);
            const res = mockResponse();
            const middleware = validate(createDonationSchema);

            middleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Validation error',
                errors: expect.arrayContaining([
                    expect.objectContaining({
                        field: 'qtdMaterial',
                        message: expect.stringMatching(/Quantity must be a number|expected number, received/)
                    })
                ])
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should reject quantity of 0 (not positive)', () => {
            const invalidDonation = {
                ecopointId: '1',
                materialType: 'metal',
                qtdMaterial: 0
            };

            const req = mockRequest(invalidDonation);
            const res = mockResponse();
            const middleware = validate(createDonationSchema);

            middleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Validation error',
                errors: expect.arrayContaining([
                    expect.objectContaining({
                        field: 'qtdMaterial',
                        message: 'Quantity must be a positive number'
                    })
                ])
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should reject negative quantity', () => {
            const invalidDonation = {
                ecopointId: '1',
                materialType: 'paper',
                qtdMaterial: -5
            };

            const req = mockRequest(invalidDonation);
            const res = mockResponse();
            const middleware = validate(createDonationSchema);

            middleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should accept quantity of exactly 1 (minimum positive)', () => {
            const validDonation = {
                ecopointId: '1',
                materialType: 'plastic',
                qtdMaterial: 1
            };

            const req = mockRequest(validDonation);
            const res = mockResponse();
            const middleware = validate(createDonationSchema);

            middleware(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledTimes(1);
        });

        it('should reject decimal quantity (must be integer)', () => {
            const invalidDonation = {
                ecopointId: '1',
                materialType: 'glass',
                qtdMaterial: 5.5
            };

            const req = mockRequest(invalidDonation);
            const res = mockResponse();
            const middleware = validate(createDonationSchema);

            middleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Validation error',
                errors: expect.arrayContaining([
                    expect.objectContaining({
                        field: 'qtdMaterial',
                        message: 'Quantity must be an integer'
                    })
                ])
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should accept large integer quantity', () => {
            const validDonation = {
                ecopointId: '1',
                materialType: 'metal',
                qtdMaterial: 999999
            };

            const req = mockRequest(validDonation);
            const res = mockResponse();
            const middleware = validate(createDonationSchema);

            middleware(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledTimes(1);
        });
    });

    describe('BVA - Description Validation', () => {
        it('should accept empty description', () => {
            const validDonation = {
                ecopointId: '1',
                materialType: 'plastic',
                qtdMaterial: 5,
                description: ''
            };

            const req = mockRequest(validDonation);
            const res = mockResponse();
            const middleware = validate(createDonationSchema);

            middleware(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledTimes(1);
        });

        it('should trim whitespace from description', () => {
            const validDonation = {
                ecopointId: '1',
                materialType: 'glass',
                qtdMaterial: 3,
                description: '  Clean bottles  '
            };

            const req = mockRequest(validDonation);
            const res = mockResponse();
            const middleware = validate(createDonationSchema);

            middleware(req, res, mockNext);

            expect(req.body.description).toBe('Clean bottles');
            expect(mockNext).toHaveBeenCalledTimes(1);
        });
    });

    describe('Update Donation Schema - BVA', () => {
        it('should reject empty update object', () => {
            const invalidUpdate = {};

            const req = mockRequest(invalidUpdate);
            const res = mockResponse();
            const middleware = validate(updateDonationSchema);

            middleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Validation error',
                errors: expect.arrayContaining([
                    expect.objectContaining({
                        message: 'At least one field must be provided for update'
                    })
                ])
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should reject invalid materialType in update', () => {
            const invalidUpdate = {
                materialType: 'cardboard'
            };

            const req = mockRequest(invalidUpdate);
            const res = mockResponse();
            const middleware = validate(updateDonationSchema);

            middleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should reject zero quantity in update', () => {
            const invalidUpdate = {
                qtdMaterial: 0
            };

            const req = mockRequest(invalidUpdate);
            const res = mockResponse();
            const middleware = validate(updateDonationSchema);

            middleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should reject decimal quantity in update', () => {
            const invalidUpdate = {
                qtdMaterial: 3.7
            };

            const req = mockRequest(invalidUpdate);
            const res = mockResponse();
            const middleware = validate(updateDonationSchema);

            middleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(mockNext).not.toHaveBeenCalled();
        });
    });

    describe('Multiple Field Errors', () => {
        it('should return multiple validation errors for multiple invalid fields', () => {
            const invalidDonation = {
                ecopointId: '',
                materialType: 'invalid',
                qtdMaterial: -5
            };

            const req = mockRequest(invalidDonation);
            const res = mockResponse();
            const middleware = validate(createDonationSchema);

            middleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Validation error',
                errors: expect.arrayContaining([
                    expect.objectContaining({ field: 'ecopointId' }),
                    expect.objectContaining({ field: 'materialType' }),
                    expect.objectContaining({ field: 'qtdMaterial' })
                ])
            });
            expect(mockNext).not.toHaveBeenCalled();
        });
    });
});
