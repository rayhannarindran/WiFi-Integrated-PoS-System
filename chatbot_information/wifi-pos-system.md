# Wi-Fi POS System Architecture

## Components:

1. Point of Sale (PoS) System
2. QR Code Generator
3. Wi-Fi Access Point
4. Captive Portal
5. Backend Server
6. Database

## Implementation Steps:

### 1. Point of Sale (PoS) System
- Integrate with existing PoS software or develop a custom solution
- After a successful purchase, trigger QR code generation

### 2. QR Code Generator
- Generate a unique QR code for each purchase
- Encode purchase details, timestamp, and a unique identifier

### 3. Wi-Fi Access Point
- Set up a Wi-Fi access point with restricted access
- Configure to redirect all traffic to the captive portal

### 4. Captive Portal
- Develop a web-based interface for QR code scanning
- Implement QR code validation logic
- Handle user authentication and Wi-Fi access granting

### 5. Backend Server
- Manage communication between components
- Handle QR code validation requests
- Control Wi-Fi access permissions

### 6. Database
- Store purchase information, QR codes, and Wi-Fi access details
- Track active connections and their durations

## System Flow:

1. Customer makes a purchase at the PoS
2. PoS system generates a unique QR code and prints it
3. Customer connects to the Wi-Fi network
4. Captive portal intercepts the connection
5. Customer scans the QR code using the captive portal interface
6. Backend server validates the QR code
7. If valid, the server grants Wi-Fi access for a specified duration
8. Customer is connected to the internet

## Multiple Device Handling:

To handle multiple devices per customer:

1. Implement a device limit per QR code (e.g., 3 devices)
2. Store device MAC addresses in the database
3. Check the number of connected devices when a new device attempts to connect
4. If the limit is reached, deny access or prompt for additional purchase

## Code Snippets:

### QR Code Generation (Python with qrcode library):

```python
import qrcode
import json

def generate_qr_code(purchase_id, timestamp, duration):
    data = json.dumps({
        "purchase_id": purchase_id,
        "timestamp": timestamp,
        "duration": duration
    })
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    img.save(f"qr_code_{purchase_id}.png")

# Usage
generate_qr_code("PUR123456", "2023-09-07T12:00:00", 3600)
```

### Captive Portal QR Code Scanning (JavaScript):

```javascript
// Using a library like instascan for QR code scanning
let scanner = new Instascan.Scanner({ video: document.getElementById('qr-video') });

scanner.addListener('scan', function (content) {
  // Send content to backend for validation
  fetch('/validate-qr', {
    method: 'POST',
    body: JSON.stringify({ qrContent: content }),
    headers: { 'Content-Type': 'application/json' }
  })
  .then(response => response.json())
  .then(data => {
    if (data.valid) {
      // Grant Wi-Fi access
      grantWiFiAccess(data.deviceMAC, data.duration);
    } else {
      alert('Invalid QR code');
    }
  });
});

Instascan.Camera.getCameras().then(cameras => {
  if (cameras.length > 0) {
    scanner.start(cameras[0]);
  } else {
    console.error('No cameras found.');
  }
});
```

### Backend Server Wi-Fi Access Control (Node.js with Express):

```javascript
const express = require('express');
const app = express();

app.post('/validate-qr', (req, res) => {
  const { qrContent } = req.body;
  // Validate QR code content
  // Check if it's a valid purchase and not expired
  // If valid, grant Wi-Fi access
  
  // Pseudo-code for granting access
  if (isValidQRCode(qrContent)) {
    const deviceMAC = getDeviceMAC(req);
    const duration = extractDuration(qrContent);
    grantWiFiAccess(deviceMAC, duration);
    res.json({ valid: true, deviceMAC, duration });
  } else {
    res.json({ valid: false });
  }
});

function grantWiFiAccess(deviceMAC, duration) {
  // Use system commands or Wi-Fi management library to grant access
  // For example, using iptables on Linux:
  // exec(`iptables -I FORWARD -m mac --mac-source ${deviceMAC} -j ACCEPT`);
  // Set a timeout to revoke access after the specified duration
  setTimeout(() => revokeWiFiAccess(deviceMAC), duration * 1000);
}

function revokeWiFiAccess(deviceMAC) {
  // Remove the iptables rule or use Wi-Fi management library to revoke access
  // exec(`iptables -D FORWARD -m mac --mac-source ${deviceMAC} -j ACCEPT`);
}

app.listen(3000, () => console.log('Server running on port 3000'));
```

This system architecture and code snippets provide a foundation for implementing the Wi-Fi POS system. You'll need to adapt and expand on these components based on your specific requirements and environment.
