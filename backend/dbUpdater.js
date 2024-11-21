require('dotenv').config();
const mongoose = require('mongoose');
const cron = require('node-cron');
const routerosApi = require('routeros-api');
const Token = require('../../models/Token'); // Model untuk Token
const Device = require('../../models/Device'); // Model untuk Device
const { logger } = require('./dbUtils'); // Logger

// Fungsi untuk memutuskan koneksi perangkat di Router MikroTik
async function disconnectFromMikroTik(ip, mac) {
    const connection = new routerosApi.RouterOsApiPool({
        host: process.env.MIKROTIK_HOST,
        user: process.env.MIKROTIK_USER,
        password: process.env.MIKROTIK_PASSWORD
    });

    try {
        const api = connection.getApi();
        await api.write('/ip/hotspot/active/remove', {
            mac_address: mac,
            address: ip
        });
        logger.info(`Perangkat dengan IP: ${ip} dan MAC: ${mac} diputus koneksinya.`);
    } catch (error) {
        logger.error(`Gagal memutus koneksi perangkat IP: ${ip}, MAC: ${mac} - ${error.message}`);
    } finally {
        connection.close();
    }
}

// Fungsi utama untuk memproses token dan perangkat kadaluarsa
async function processExpiredTokens() {
    try {
        // Koneksi ke database
        await mongoose.connect(process.env.DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        logger.info('Koneksi ke database berhasil.');

        // Langkah 1: Cari token yang telah kadaluarsa
        const now = new Date();
        const expiredTokens = await Token.find({ time_limit: { $lt: now } });

        if (expiredTokens.length === 0) {
            logger.info("Tidak ada token kadaluarsa.");
            return;
        }

        logger.info(`Ditemukan ${expiredTokens.length} token kadaluarsa.`);

        // Langkah 2: Ambil ID device yang terkait
        const deviceIds = expiredTokens.map(token => token.device_id);

        // Langkah 3: Cari perangkat berdasarkan ID
        const devices = await Device.find({ device_id: { $in: deviceIds } });

        if (devices.length === 0) {
            logger.warn("Tidak ada perangkat terkait dengan token kadaluarsa.");
            return;
        }

        // Langkah 4: Putuskan koneksi perangkat di MikroTik
        for (const device of devices) {
            const { ip_address, mac_address } = device;
            if (!ip_address || !mac_address) {
                logger.warn(`Perangkat ID: ${device.device_id} tidak memiliki IP/MAC.`);
                continue;
            }

            await disconnectFromMikroTik(ip_address, mac_address);
        }

        // Langkah 5: Hapus data token dan perangkat
        await Token.deleteMany({ _id: { $in: expiredTokens.map(token => token._id) } });
        await Device.deleteMany({ device_id: { $in: deviceIds } });

        logger.info("Data token dan perangkat kadaluarsa telah dihapus.");
    } catch (error) {
        logger.error(`Terjadi kesalahan saat memproses token kadaluarsa: ${error.message}`);
    } finally {
        // Tutup koneksi database
        await mongoose.disconnect();
    }
}

// Jalankan setiap 5 menit menggunakan cron
cron.schedule('*/5 * * * *', async () => {
    logger.info("Memulai pengecekan token kadaluarsa...");
    await processExpiredTokens();
    logger.info("Pengecekan selesai.");
});

// Eksekusi pertama kali saat file dijalankan
(async () => {
    logger.info("Menjalankan dbUpdater.js...");
    await processExpiredTokens();
})();
