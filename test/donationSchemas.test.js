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

describe('Donation Schema Validation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Create Donation Schema - Success Cases', () => {
        it('should successfully validate valid donation data with all required fields', () => {
            const validDonation = {
                userId: '507f1f77bcf86cd799439011',
                materialType: 'Plastic',
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
                userId: '507f1f77bcf86cd799439011',
                materialType: 'Glass',
                qtdMaterial: 5
            };

            const req = mockRequest(validDonation);
            const res = mockResponse();
            const middleware = validate(createDonationSchema);

            middleware(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(req.body.description).toBe(''); // Default value
        });

        it('should trim whitespace from userId and materialType', () => {
            const validDonation = {
                userId: '  507f1f77bcf86cd799439011  ',
                materialType: '  Metal  ',
                qtdMaterial: 3
            };

            const req = mockRequest(validDonation);
            const res = mockResponse();
            const middleware = validate(createDonationSchema);

            middleware(req, res, mockNext);

            expect(req.body.userId).toBe('507f1f77bcf86cd799439011');
            expect(req.body.materialType).toBe('Metal');
            expect(mockNext).toHaveBeenCalledTimes(1);
        });

        it('should accept donation with donationDate as datetime string', () => {
            const validDonation = {
                userId: '507f1f77bcf86cd799439011',
                materialType: 'Paper',
                qtdMaterial: 20,
                donationDate: '2025-11-06T10:30:00Z'
            };

            const req = mockRequest(validDonation);
            const res = mockResponse();
            const middleware = validate(createDonationSchema);

            middleware(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledTimes(1);
        });
    });

    describe('Update Donation Schema - Success Cases', () => {
        it('should successfully validate update with single field', () => {
            const updateData = {
                materialType: 'Cardboard'
            };

            const req = mockRequest(updateData);
            const res = mockResponse();
            const middleware = validate(updateDonationSchema);

            middleware(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledTimes(1);
        });

        it('should successfully validate update with multiple fields', () => {
            const updateData = {
                materialType: 'Aluminum',
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

    describe('BVA - UserId Validation', () => {
        it('should reject empty userId', () => {
            const invalidDonation = {
                userId: '',
                materialType: 'Plastic',
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
                        field: 'userId',
                        message: 'User ID cannot be empty'
                    })
                ])
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should reject when userId is missing', () => {
            const invalidDonation = {
                materialType: 'Glass',
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
                        field: 'userId',
                        message: expect.stringMatching(/User ID cannot be empty|expected string, received undefined/)
                    })
                ])
            });
            expect(mockNext).not.toHaveBeenCalled();
        });
    });

    describe('BVA - MaterialType Validation', () => {
        it('should reject materialType with 1 character (below minimum)', () => {
            const invalidDonation = {
                userId: '507f1f77bcf86cd799439011',
                materialType: 'P',
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
                        message: 'Material type must be at least 2 characters long'
                    })
                ])
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should accept materialType with exactly 2 characters (minimum boundary)', () => {
            const validDonation = {
                userId: '507f1f77bcf86cd799439011',
                materialType: 'Ab',
                qtdMaterial: 5
            };

            const req = mockRequest(validDonation);
            const res = mockResponse();
            const middleware = validate(createDonationSchema);

            middleware(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledTimes(1);
        });

        it('should reject when materialType is missing', () => {
            const invalidDonation = {
                userId: '507f1f77bcf86cd799439011',
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
                        message: expect.stringMatching(/Material type is required|Material type must be at least 2 characters|expected string, received undefined/)
                    })
                ])
            });
            expect(mockNext).not.toHaveBeenCalled();
        });
    });

    describe('BVA - Quantity (qtdMaterial) Validation', () => {
        it('should reject when quantity is missing', () => {
            const invalidDonation = {
                userId: '507f1f77bcf86cd799439011',
                materialType: 'Plastic'
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
                userId: '507f1f77bcf86cd799439011',
                materialType: 'Glass',
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
                userId: '507f1f77bcf86cd799439011',
                materialType: 'Metal',
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
                userId: '507f1f77bcf86cd799439011',
                materialType: 'Paper',
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
                userId: '507f1f77bcf86cd799439011',
                materialType: 'Plastic',
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
                userId: '507f1f77bcf86cd799439011',
                materialType: 'Glass',
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
                userId: '507f1f77bcf86cd799439011',
                materialType: 'Aluminum',
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
                userId: '507f1f77bcf86cd799439011',
                materialType: 'Plastic',
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
                userId: '507f1f77bcf86cd799439011',
                materialType: 'Glass',
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

        it('should reject materialType with 1 character in update', () => {
            const invalidUpdate = {
                materialType: 'P'
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
                userId: '',
                materialType: 'P',
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
                    expect.objectContaining({ field: 'userId' }),
                    expect.objectContaining({ field: 'materialType' }),
                    expect.objectContaining({ field: 'qtdMaterial' })
                ])
            });
            expect(mockNext).not.toHaveBeenCalled();
        });
    });
});
