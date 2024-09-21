require('dotenv').config();
const dbService = require('../../backend/services/dbService');

//console.log('process.env.MONGODB_URI:', process.env.MONGODB_URI);

describe('dbService', () => {
    let connection;
    let db;
    
    beforeAll(async () => {
        connection = await MongoClient.connect('mongodb://localhost:27017/');
        db = connection.db('pos_dummy');
    });
    
    afterAll(async () => {
        await connection.close();
    });

    it('should connect to the database successfully', async () => {
        const result = await dbService.getConnection();
        expect(result).toEqual(db);
    });
    
    it('should insert a token successfully', async () => {
        const mockRecord = {
            token: 'exampleToken',
            status: 'valid',
            purchase_id: 'examplePurchaseID',
            valid_from: '2022-10-20T03:00:00.000Z',
            valid_until: '2022-10-20T06:00:00.000Z',
            max_devices: 1,
            devices_connected: [],
            time_limit: 180,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        const result = await dbService.insertTokenRecord(mockRecord);
        expect(result).toEqual({
            insertedCount: 1,
            insertedId: expect.any(Object)
        });
    });
});