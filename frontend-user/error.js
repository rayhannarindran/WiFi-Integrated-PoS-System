// Get QR data and validation status from query string
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
const validationStatus = urlParams.get('status');

document.getElementById('token').textContent = token;

// Show the validation status
const validationStatusElement = document.getElementById('validation-status');
if (validationStatus === 'valid') {
    validationStatusElement.textContent = 'Valid token. You may proceed.';
    validationStatusElement.style.color = 'green';
} else {
    validationStatusElement.textContent = 'Invalid token. Please try again.';
    validationStatusElement.style.color = 'red';
}

function fetchDeviceInfoFromMikrotik() {
    // Gunakan variabel otomatis Mikrotik
    const ipAddress = '$(ip)';
    const macAddress = '$(mac)';

    // Tampilkan langsung ke halaman
    document.getElementById('ip-address').textContent = ipAddress || 'Unavailable';
    document.getElementById('mac-address').textContent = macAddress || 'Unavailable';
}

// Panggil fungsi untuk Mikrotik
fetchDeviceInfoFromMikrotik();
