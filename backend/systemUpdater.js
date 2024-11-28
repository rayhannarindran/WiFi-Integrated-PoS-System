require('dotenv').config();
const mongoose = require('mongoose');
const cron = require('node-cron');
const routerosApi = require('routeros-api');
const Token = require('../../models/Token'); // Model untuk Token
const Device = require('../../models/Device'); // Model untuk Device
const { logger } = require('./dbUtils'); // Logger

//! FUNCTIONS HERE

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
