require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const Token = require('../../models/Token'); // Model untuk Token
const Device = require('../../models/Device'); // Model untuk Device
const { logger } = require('./dbUtils'); // Logger

// URL dasar dari router service
const ROUTER_SERVICE_URL = 'http://localhost:3000';

// Fungsi untuk memutuskan koneksi perangkat melalui router service
async function disconnectDevice(ip_address, mac_address) {
    try {
        const response = await axios.post(`${ROUTER_SERVICE_URL}/remove-device`, {
            mac_address,
            ip_address
        });
        logger.info(`Perangkat dengan IP: ${ip_address} dan MAC: ${mac_address} berhasil diputus koneksinya.`);
        return response.data;
    } catch (error) {
        logger.error(`Gagal memutus koneksi perangkat IP: ${ip_address}, MAC: ${mac_address} - ${error.message}`);
        throw new Error(error.response ? error.response.data.message : 'Failed to remove device');
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
        const expiredTokens = await Token.find({ valid_until: { $lt: now }, status: 'valid' }).populate('devices_connected.device_id');

        if (expiredTokens.length === 0) {
            logger.info("Tidak ada token kadaluarsa.");
            return;
        }

        logger.info(`Ditemukan ${expiredTokens.length} token kadaluarsa.`);

        for (const token of expiredTokens) {
            const { devices_connected } = token;

            // Langkah 2: Simpan ID perangkat terkait sementara
            const deviceIds = devices_connected.map(deviceEntry => deviceEntry.device_id);

            // Langkah 3: Cari perangkat berdasarkan ID
            const devices = await Device.find({ _id: { $in: deviceIds } });

            for (const device of devices) {
                const { ip_address, mac_address } = device;

                if (!ip_address || !mac_address) {
                    logger.warn(`Perangkat ID: ${device._id} tidak memiliki IP atau MAC.`);
                    continue;
                }

                try {
                    // Langkah 4: Putuskan koneksi perangkat
                    await disconnectDevice(ip_address, mac_address);
                } catch (error) {
                    logger.error(`Kesalahan saat memutus koneksi perangkat ID: ${device._id} - ${error.message}`);
                }
            }

            // Langkah 5: Tandai token sebagai invalid
            try {
                token.status = 'invalid';
                await token.save();
                logger.info(`Token ID: ${token._id} diubah statusnya menjadi invalid.`);
            } catch (error) {
                logger.error(`Kesalahan saat mengubah status token ID: ${token._id} - ${error.message}`);
            }

            // Langkah 6: Hapus perangkat yang terkait dengan token
            try {
                await Device.deleteMany({ _id: { $in: deviceIds } });
                logger.info(`Perangkat terkait token ID: ${token._id} berhasil dihapus.`);
            } catch (error) {
                logger.error(`Kesalahan saat menghapus perangkat terkait token ID: ${token._id} - ${error.message}`);
            }
        }
    } catch (error) {
        logger.error(`Terjadi kesalahan saat memproses token kadaluarsa: ${error.message}`);
    } finally {
        // Tutup koneksi database
        await mongoose.disconnect();
    }
}

// Jalankan pengecekan setiap 20 detik
setInterval(async () => {
    logger.info("Memulai pengecekan token kadaluarsa...");
    await processExpiredTokens();
    logger.info("Pengecekan selesai.");
}, 20000); // Interval dalam milidetik (20 detik)

// Eksekusi pertama kali saat file dijalankan
(async () => {
    logger.info("Menjalankan dbUpdater.js...");
    await processExpiredTokens();
})();
