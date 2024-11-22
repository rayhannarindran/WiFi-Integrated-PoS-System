import { useState } from 'react';
import './Settings.css';

function App() {
  // State to manage the visibility of each section
  const [showBackend, setShowBackend] = useState(false);
  const [showMikrotik, setShowMikrotik] = useState(false);
  const [showPrinter, setShowPrinter] = useState(false);
  const [showNetworkSpec, setShowNetworkSpec] = useState(false);

  // Handle form input states
  const [formData, setFormData] = useState({
    BACKEND_SERVER_PORT: '',
    MIKROTIK_PYTHON_API_PORT: '',
    MONGODB_URI: '',
    MIKROTIK_HOST: '',
    MIKROTIK_USER: '',
    MIKROTIK_PASS: '',
    PRINTER_USB_VENDOR_ID: '',
    PRINTER_USB_PRODUCT_ID: '',
    MAX_SYSTEM_BANDWIDTH: '',
    MAX_SYSTEM_DEVICES: '',
    MINIMUM_PAYMENT_PER_DEVICE: '',
    TIME_LIMIT_PER_TOKEN: '',
  });

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission (just log the data for now)
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Environment Variables:', formData);
  };

  return (
    <div className="App">
      <h1>Environment Variables Editor</h1>
      <form onSubmit={handleSubmit}>

        {/* Backend Variables Section */}
        <button type="button" onClick={() => setShowBackend(!showBackend)}>
          {showBackend ? 'Hide' : 'Show'} System Ports
        </button>
        {showBackend && (
          <div className="section">
            <div>
              <label htmlFor="BACKEND_SERVER_PORT">Backend Server Port:</label>
              <input
                type="text"
                id="BACKEND_SERVER_PORT"
                name="BACKEND_SERVER_PORT"
                value={formData.BACKEND_SERVER_PORT}
                onChange={handleChange}
                placeholder="3001"
              />
            </div>
            <div>
              <label htmlFor="MIKROTIK_PYTHON_API_PORT">MikroTik Python API Port:</label>
              <input
                type="text"
                id="MIKROTIK_PYTHON_API_PORT"
                name="MIKROTIK_PYTHON_API_PORT"
                value={formData.MIKROTIK_PYTHON_API_PORT}
                onChange={handleChange}
                placeholder="4000"
              />
            </div>
          </div>
        )}

        {/* MikroTik Variables Section */}
        <button type="button" onClick={() => setShowMikrotik(!showMikrotik)}>
          {showMikrotik ? 'Hide' : 'Show'} MikroTik Login Credentials
        </button>
        {showMikrotik && (
          <div className="section">
            <div>
              <label htmlFor="MIKROTIK_HOST">MikroTik Host:</label>
              <input
                type="text"
                id="MIKROTIK_HOST"
                name="MIKROTIK_HOST"
                value={formData.MIKROTIK_HOST}
                onChange={handleChange}
                placeholder="192.168.88.1"
              />
            </div>
            <div>
              <label htmlFor="MIKROTIK_USER">MikroTik User:</label>
              <input
                type="text"
                id="MIKROTIK_USER"
                name="MIKROTIK_USER"
                value={formData.MIKROTIK_USER}
                onChange={handleChange}
                placeholder="admin"
              />
            </div>
            <div>
              <label htmlFor="MIKROTIK_PASS">MikroTik Password:</label>
              <input
                type="password"
                id="MIKROTIK_PASS"
                name="MIKROTIK_PASS"
                value={formData.MIKROTIK_PASS}
                onChange={handleChange}
                placeholder="password"
              />
            </div>
          </div>
        )}

        {/* Printer Variables Section */}
        <button type="button" onClick={() => setShowPrinter(!showPrinter)}>
          {showPrinter ? 'Hide' : 'Show'} Thermal Printer USB IDs
        </button>
        {showPrinter && (
          <div className="section">
            <div>
              <label htmlFor="PRINTER_USB_VENDOR_ID">Printer USB Vendor ID:</label>
              <input
                type="text"
                id="PRINTER_USB_VENDOR_ID"
                name="PRINTER_USB_VENDOR_ID"
                value={formData.PRINTER_USB_VENDOR_ID}
                onChange={handleChange}
                placeholder="0fe6"
              />
            </div>
            <div>
              <label htmlFor="PRINTER_USB_PRODUCT_ID">Printer USB Product ID:</label>
              <input
                type="text"
                id="PRINTER_USB_PRODUCT_ID"
                name="PRINTER_USB_PRODUCT_ID"
                value={formData.PRINTER_USB_PRODUCT_ID}
                onChange={handleChange}
                placeholder="811e"
              />
            </div>
          </div>
        )}

        {/* Network Spec Variables Section */}
        <button type="button" onClick={() => setShowNetworkSpec(!showNetworkSpec)}>
          {showNetworkSpec ? 'Hide' : 'Show'} Network Management
        </button>
        {showNetworkSpec && (
          <div className="section">
            <div>
              <label htmlFor="MAX_SYSTEM_BANDWIDTH">Max System Bandwidth (Mbps):</label>
              <input
                type="text"
                id="MAX_SYSTEM_BANDWIDTH"
                name="MAX_SYSTEM_BANDWIDTH"
                value={formData.MAX_SYSTEM_BANDWIDTH}
                onChange={handleChange}
                placeholder="300"
              />
            </div>
            <div>
              <label htmlFor="MAX_SYSTEM_DEVICES">Max System Devices:</label>
              <input
                type="text"
                id="MAX_SYSTEM_DEVICES"
                name="MAX_SYSTEM_DEVICES"
                value={formData.MAX_SYSTEM_DEVICES}
                onChange={handleChange}
                placeholder="20"
              />
            </div>
            <div>
              <label htmlFor="MINIMUM_PAYMENT_PER_DEVICE">Minimum Payment Per Device (Rupiah):</label>
              <input
                type="text"
                id="MINIMUM_PAYMENT_PER_DEVICE"
                name="MINIMUM_PAYMENT_PER_DEVICE"
                value={formData.MINIMUM_PAYMENT_PER_DEVICE}
                onChange={handleChange}
                placeholder="30000"
              />
            </div>
            <div>
              <label htmlFor="TIME_LIMIT_PER_TOKEN">Time Limit Per Token (Minutes):</label>
              <input
                type="text"
                id="TIME_LIMIT_PER_TOKEN"
                name="TIME_LIMIT_PER_TOKEN"
                value={formData.TIME_LIMIT_PER_TOKEN}
                onChange={handleChange}
                placeholder="180"
              />
            </div>
          </div>
        )}

        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}

export default App;
