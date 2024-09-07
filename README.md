# Wi-Fi Access Control System Linked to Point of Sale (PoS)

## Overview
This system provides timed and restricted Wi-Fi access to customers who make a purchase through a Point of Sale (PoS) system. Access is granted via a QR code printed on the receipt, which the customer can scan using a captive portal. The system is designed to ensure that Wi-Fi access is only granted to paying customers and can be restricted to a limited number of devices per purchase.

## System Architecture

### 1. PoS Software
- **Purpose:** Handles sales transactions and generates a unique QR code for each purchase.
- **Responsibilities:**
  - Sends a request to the backend server for token generation.
  - Receives and prints a QR code on the customer's receipt.
- **Integration:** Connected to the backend server and receipt printer.

### 2. Backend Server
- **Purpose:** Manages token generation, validation, device connections, and enforces Wi-Fi access rules.
- **Responsibilities:**
  - Generates unique tokens after each purchase.
  - Validates tokens and manages device connections.
  - Communicates with the MikroTik router to grant or revoke Wi-Fi access.
  - Stores token data in a MongoDB database and uses Redis for caching.
- **APIs:**
  - `POST /generate-token`: Generate a token after a purchase.
  - `POST /validate-token`: Validate a token when a user tries to connect.
  - `POST /manage-device`: Add or remove devices associated with a token.

### 3. Captive Portal
- **Purpose:** Provides a web interface for users to enter their token or scan the QR code.
- **Responsibilities:**
  - Captures the token entered by the user.
  - Sends the token to the backend server for validation.
  - Redirects the user to the internet if the token is valid.
- **User Flow:**
  - User connects to the Wi-Fi network and is redirected to the captive portal.
  - User enters the token or scans the QR code.
  - Upon successful validation, the user is granted internet access.

### 4. RouterOS API (MikroTik Router)
- **Purpose:** Controls access to the Wi-Fi network based on the backend server's instructions.
- **Responsibilities:**
  - Grants or revokes Wi-Fi access to devices based on token validation.
  - Enforces rules such as device limits and session expiration times.
- **Integration:** Communicates with the backend server via the RouterOS API.

## Installation

### Prerequisites
- **PoS Software:** Must support API calls for token generation and QR code printing.
- **Backend Server:**
  - Node.js with Express framework.
  - MongoDB for database.
  - Redis for caching.
- **Captive Portal:**
  - Web server (e.g., Nginx or Apache) to host the portal.
  - HTML/CSS/JavaScript for the front-end.
- **MikroTik Router:**
  - RouterOS API enabled.
  - Access credentials for the backend server.

### Steps

1. **Set up the PoS System:**
   - Integrate the PoS software with the backend server to generate and print QR codes.

2. **Deploy the Backend Server:**
   - Clone the repository and install dependencies:
     ```bash
     git clone <repository-url>
     cd backend-server
     npm install
     ```
   - Configure environment variables for database connections and API keys.
   - Start the server:
     ```bash
     npm start
     ```

3. **Configure the Captive Portal:**
   - Deploy the captive portal on a web server.
   - Ensure it is set to intercept all Wi-Fi connections and redirect them to the portal page.

4. **Configure the MikroTik Router:**
   - Enable the RouterOS API.
   - Configure firewall rules and access control lists (ACLs) based on backend instructions.

### Usage

1. **Customer Purchase:**
   - A customer makes a purchase, and the PoS system prints a receipt with a QR code.

2. **Wi-Fi Access:**
   - The customer connects to the Wi-Fi network and is redirected to the captive portal.
   - The customer scans the QR code or enters the token manually.
   - Upon validation, the customer’s device is granted internet access.

3. **Device Management:**
   - The system tracks the number of devices connected with the same token.
   - Access is revoked after the session expires or the device limit is reached.

## Contributing
- Contributions are welcome! Please open an issue or submit a pull request.

## License
- This project is licensed under the MIT License. See the LICENSE file for details.

## Contact
- For support or inquiries, contact [Your Name] at [your-email@example.com].
