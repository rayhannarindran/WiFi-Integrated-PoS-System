const { generateToken, generateQR, generateTokenRecord } = require('../../backend/services/tokenService');

describe('Token Service', () => {
    describe('generateToken', () => {
        it('should generate a token based on the purchase data', () => {
            const pos_data = {
                id: '12345',
                payment_no: "12345",
                created_at: '2022-10-20T10:00:00.000000+07:00',
                discount: 5000,
                subtotal: 100000,
                gratuities: 5000,
                taxes: 10000
            };
            const token = generateToken(pos_data);
            expect(token).toMatch(/^12345_2022-10-20T03:00:00.000Z_[a-f0-9]{10}$/);
        });
    });

    describe('generateQR', () => {
        it('should generate a QR code for the token', async () => {
            const token = '12345_2022-10-20T03:00:00.000Z_abcdef1234';
            const qrCode = await generateQR(token);
            expect(qrCode).toMatch(/^data:image\/png;base64,/);
        });
    });

    describe('generateTokenRecord', () => {
        it('should generate a token record based on the purchase data', () => {
            const pos_data = {
                id: '12345',
                payment_no: "12345",
                created_at: '2022-10-20T10:00:00.000000+07:00',
                discount: 5000,
                subtotal: 100000,
                gratuities: 5000,
                taxes: 10000
            };
            const tokenRecord = generateTokenRecord(pos_data);
            expect(tokenRecord).toEqual({
                token: expect.stringMatching(/^12345_2022-10-20T03:00:00.000Z_[a-f0-9]{10}$/),
                status: 'valid',
                purchase_id: '12345',
                valid_from: '2022-10-20T03:00:00.000Z',
                valid_until: '2022-10-20T06:00:00.000Z',
                max_devices: 3,
                devices_connected: [],
                time_limit: 180,
                created_at: expect.any(String),
                updated_at: expect.any(String)
            });
        });
    });
});