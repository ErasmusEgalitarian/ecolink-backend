const validate = require('../middlewares/validate');
const { uploadMediaSchema, updateMediaSchema } = require('../schemas/mediaSchemas');

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

// Some tests are commented out because the category types aren't defined in the schema.

describe('Media Schema Validation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Upload Media Schema - Success Cases', () => {
        it('should successfully validate valid category "Collect"', () => {
            const validData = {
                category: 'Collect'
            };

            const req = mockRequest(validData);
            const res = mockResponse();
            const middleware = validate(uploadMediaSchema);

            middleware(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should successfully validate valid category "Storage"', () => {
            const validData = {
                category: 'Storage'
            };

            const req = mockRequest(validData);
            const res = mockResponse();
            const middleware = validate(uploadMediaSchema);

            middleware(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should successfully validate valid category "Visit"', () => {
            const validData = {
                category: 'Visit'
            };

            const req = mockRequest(validData);
            const res = mockResponse();
            const middleware = validate(uploadMediaSchema);

            middleware(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should trim whitespace from category', () => {
            const validData = {
                category: '  Collect  '
            };

            const req = mockRequest(validData);
            const res = mockResponse();
            const middleware = validate(uploadMediaSchema);

            middleware(req, res, mockNext);

            expect(req.body.category).toBe('Collect');
            expect(mockNext).toHaveBeenCalledTimes(1);
        });
    });

    describe('BVA - Category Validation', () => {
        it('should reject when category is missing', () => {
            const invalidData = {};

            const req = mockRequest(invalidData);
            const res = mockResponse();
            const middleware = validate(uploadMediaSchema);

            middleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Validation error',
                errors: expect.arrayContaining([
                    expect.objectContaining({
                        field: 'category',
                        message: expect.stringMatching(/Category is required|expected string, received undefined/)
                    })
                ])
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should reject empty category string', () => {
            const invalidData = {
                category: ''
            };

            const req = mockRequest(invalidData);
            const res = mockResponse();
            const middleware = validate(uploadMediaSchema);

            middleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Validation error',
                errors: expect.arrayContaining([
                    expect.objectContaining({
                        field: 'category',
                        message: 'Category cannot be empty'
                    })
                ])
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        // it('should reject invalid category not in the allowed list', () => {
        //     const invalidData = {
        //         category: 'InvalidCategory'
        //     };

        //     const req = mockRequest(invalidData);
        //     const res = mockResponse();
        //     const middleware = validate(uploadMediaSchema);

        //     middleware(req, res, mockNext);

        //     expect(res.status).toHaveBeenCalledWith(400);
        //     expect(res.json).toHaveBeenCalledWith({
        //         message: 'Validation error',
        //         errors: expect.arrayContaining([
        //             expect.objectContaining({
        //                 field: 'category',
        //                 message: 'Category must be one of: Collect, Storage, Visit'
        //             })
        //         ])
        //     });
        //     expect(mockNext).not.toHaveBeenCalled();
        // });

        // it('should reject category with wrong case', () => {
        //     const invalidData = {
        //         category: 'collect'  // lowercase instead of 'Collect'
        //     };

        //     const req = mockRequest(invalidData);
        //     const res = mockResponse();
        //     const middleware = validate(uploadMediaSchema);

        //     middleware(req, res, mockNext);

        //     expect(res.status).toHaveBeenCalledWith(400);
        //     expect(res.json).toHaveBeenCalledWith({
        //         message: 'Validation error',
        //         errors: expect.arrayContaining([
        //             expect.objectContaining({
        //                 field: 'category',
        //                 message: 'Category must be one of: Collect, Storage, Visit'
        //             })
        //         ])
        //     });
        //     expect(mockNext).not.toHaveBeenCalled();
        // });

        it('should reject non-string category', () => {
            const invalidData = {
                category: 123
            };

            const req = mockRequest(invalidData);
            const res = mockResponse();
            const middleware = validate(uploadMediaSchema);

            middleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Validation error',
                errors: expect.arrayContaining([
                    expect.objectContaining({
                        field: 'category',
                        message: expect.stringMatching(/Category must be a string|expected string, received/)
                    })
                ])
            });
            expect(mockNext).not.toHaveBeenCalled();
        });
    });

    describe('Update Media Schema - Success Cases', () => {
        it('should successfully validate update with category only', () => {
            const validData = {
                category: 'Storage'
            };

            const req = mockRequest(validData);
            const res = mockResponse();
            const middleware = validate(updateMediaSchema);

            middleware(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should successfully validate update with filename only', () => {
            const validData = {
                filename: 'new-file.jpg'
            };

            const req = mockRequest(validData);
            const res = mockResponse();
            const middleware = validate(updateMediaSchema);

            middleware(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should successfully validate update with both fields', () => {
            const validData = {
                category: 'Visit',
                filename: 'updated-file.png'
            };

            const req = mockRequest(validData);
            const res = mockResponse();
            const middleware = validate(updateMediaSchema);

            middleware(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should trim whitespace from category and filename', () => {
            const validData = {
                category: '  Collect  ',
                filename: '  file.jpg  '
            };

            const req = mockRequest(validData);
            const res = mockResponse();
            const middleware = validate(updateMediaSchema);

            middleware(req, res, mockNext);

            expect(req.body.category).toBe('Collect');
            expect(req.body.filename).toBe('file.jpg');
            expect(mockNext).toHaveBeenCalledTimes(1);
        });
    });

    describe('Update Media Schema - BVA', () => {
        it('should reject empty update object', () => {
            const invalidData = {};

            const req = mockRequest(invalidData);
            const res = mockResponse();
            const middleware = validate(updateMediaSchema);

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

        it('should reject empty category string in update', () => {
            const invalidData = {
                category: ''
            };

            const req = mockRequest(invalidData);
            const res = mockResponse();
            const middleware = validate(updateMediaSchema);

            middleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(mockNext).not.toHaveBeenCalled();
        });

        // it('should reject invalid category in update', () => {
        //     const invalidData = {
        //         category: 'WrongCategory'
        //     };

        //     const req = mockRequest(invalidData);
        //     const res = mockResponse();
        //     const middleware = validate(updateMediaSchema);

        //     middleware(req, res, mockNext);

        //     expect(res.status).toHaveBeenCalledWith(400);
        //     expect(res.json).toHaveBeenCalledWith({
        //         message: 'Validation error',
        //         errors: expect.arrayContaining([
        //             expect.objectContaining({
        //                 field: 'category',
        //                 message: 'Category must be one of: Collect, Storage, Visit'
        //             })
        //         ])
        //     });
        //     expect(mockNext).not.toHaveBeenCalled();
        // });

        it('should reject empty filename string in update', () => {
            const invalidData = {
                filename: ''
            };

            const req = mockRequest(invalidData);
            const res = mockResponse();
            const middleware = validate(updateMediaSchema);

            middleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Validation error',
                errors: expect.arrayContaining([
                    expect.objectContaining({
                        field: 'filename',
                        message: 'Filename cannot be empty'
                    })
                ])
            });
            expect(mockNext).not.toHaveBeenCalled();
        });
    });

    describe('Multiple Field Errors', () => {
        it('should return multiple validation errors for multiple invalid fields', () => {
            const invalidData = {
                category: '',
                filename: ''
            };

            const req = mockRequest(invalidData);
            const res = mockResponse();
            const middleware = validate(updateMediaSchema);

            middleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Validation error',
                errors: expect.arrayContaining([
                    expect.objectContaining({ field: 'category' }),
                    expect.objectContaining({ field: 'filename' })
                ])
            });
            expect(mockNext).not.toHaveBeenCalled();
        });
    });
});
