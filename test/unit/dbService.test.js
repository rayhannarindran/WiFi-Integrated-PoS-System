const mongoose = require('mongoose');
const dbService = require('../../backend/services/dbService');
const Token = require('../../backend/models/Token');

jest.mock('../../backend/models/Token');

describe('dbService', () => {
    const mockRecord = { token: 'mockToken', status: 'valid' };
    let mockTokenInstance;

    beforeAll(() => {
        mongoose.connect = jest.fn().mockResolvedValue();
        mongoose.connection.close = jest.fn();
    });

    beforeEach(() => {
        mockTokenInstance = { save: jest.fn().mockResolvedValue(mockRecord) };
        Token.mockImplementation(() => mockTokenInstance);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it('should insert a token record successfully', async () => {
        await dbService.insertTokenRecord(mockRecord);

        expect(Token).toHaveBeenCalledWith(mockRecord);
        expect(mockTokenInstance.save).toHaveBeenCalled();
        expect(mongoose.connect).toHaveBeenCalled();
        expect(mongoose.connection.close).toHaveBeenCalled();
    });

    it('should handle errors when inserting a token', async () => {
        mockTokenInstance.save.mockRejectedValue(new Error('Insert Error'));
        console.error = jest.fn();

        await dbService.insertTokenRecord(mockRecord);

        expect(console.error).toHaveBeenCalledWith('Error inserting token:', expect.any(Error));
        expect(mongoose.connect).toHaveBeenCalled();
        expect(mongoose.connection.close).toHaveBeenCalled();
    });
});