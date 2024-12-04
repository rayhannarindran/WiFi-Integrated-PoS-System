import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Settings.css';

const BACKEND_ENV_API_URL = `http://127.0.0.1:${import.meta.env.VITE_BACKEND_SERVER_PORT}/api/env`;

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
    MIKROTIK_PASSWORD: '',
    PRINTER_USB_VENDOR_ID: '',
    PRINTER_USB_PRODUCT_ID: '',
    MAX_SYSTEM_BANDWIDTH: '',
    MAX_SYSTEM_DEVICES: '',
    MINIMUM_PAYMENT_PER_DEVICE: '',
    TIME_LIMIT_PER_TOKEN: '',
  });

  // Fetch environment variables from the backend when the component mounts
  useEffect(() => {
    const fetchEnvData = async () => {
      try {
        const response = await fetch(`${BACKEND_ENV_API_URL}/get-env`);
        const data = await response.json();

        // Parse the .env file data into key-value pairs
        const envData = data.data
          .split('\n')
          .filter((line) => line.trim() !== '') // Remove empty lines
          .reduce((acc, line) => {
            const [key, value] = line.split('=');
            acc[key] = value;
            return acc;
          }, {});

        // Update the form data with the fetched environment variables
        setFormData({
          ...formData,
          ...envData,
        });

      } catch (error) {
        console.error('Error fetching environment variables:', error);
      }
    };

    fetchEnvData();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission (just log the data for now)
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Environment Variables:', formData);
    
    // Filter formData to include only keys with non-empty values
    const filteredData = Object.entries(formData)
      .filter(([key, value]) => value.trim() !== '') // Keep only non-empty values
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});

    try {
      // Make the API call with filtered data
      const response = await fetch(`${BACKEND_ENV_API_URL}/update-env`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filteredData),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(result); // Log success message or response data
      alert('Environment variables updated successfully!');
    } catch (error) {
      console.error('Failed to update environment variables:', error);
      alert('Failed to update environment variables. Check console for details.');
    }
  };

  return (
    <div className="App">
      <h1>Environment Variables Editor</h1>

      {/* Back button to main page */}
      

      {/* Form to edit environment variables */}
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
                placeholder={formData.BACKEND_SERVER_PORT || "3001"}
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
                placeholder={formData.MIKROTIK_PYTHON_API_PORT || "4000"}
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
                placeholder={formData.MIKROTIK_HOST || "192.168.88.1"}
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
                placeholder={formData.MIKROTIK_USER || "admin"}
              />
            </div>
            <div>
              <label htmlFor="MIKROTIK_PASSWORD">MikroTik Password:</label>
              <input
                type="password"
                id="MIKROTIK_PASSWORD"
                name="MIKROTIK_PASSWORD"
                value={formData.MIKROTIK_PASSWORD}
                onChange={handleChange}
                placeholder={formData.MIKROTIK_PASSWORD || "password"}
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
                placeholder={formData.PRINTER_USB_VENDOR_ID || "0fe6"}
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
                placeholder={formData.PRINTER_USB_PRODUCT_ID || "811e"}
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
                placeholder={formData.MAX_SYSTEM_BANDWIDTH || "300"}
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
                placeholder={formData.MAX_SYSTEM_DEVICES || "20"}
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
                placeholder={formData.MINIMUM_PAYMENT_PER_DEVICE || "30000"}
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
                placeholder={formData.TIME_LIMIT_PER_TOKEN || "180"}
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          onClick={(e) => {
            e.preventDefault();
            if (window.confirm('Are you sure you want to save these changes and reboot the system?')) {
              handleSubmit(e);
            }
          }}
        >
          SAVE CHANGES AND REBOOT SYSTEM
        </button>

        <Link to="/">
          <button type="main-page-button">BACK TO MAIN PAGE</button>
        </Link>
      </form>
    </div>
  );
}

export default App;
