import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./deviceManager.css";

const BACKEND_TOKEN_API_URL = `http://127.0.0.1:${import.meta.env.VITE_BACKEND_SERVER_PORT}/api/token`;
const BACKEND_DEVICE_API_URL = `http://127.0.0.1:${import.meta.env.VITE_BACKEND_SERVER_PORT}/api/device`;
const DeviceManager = () => {
  const [tokens, setTokens] = useState([]);
  const [expandedTokens, setExpandedTokens] = useState({}); 
  const [devices, setDevices] = useState({}); 
  const [loading, setLoading] = useState({});
  const [disconnectLoading, setDisconnectLoading] = useState({});

  // Fetch all tokens on component load
  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const response = await fetch(`${BACKEND_TOKEN_API_URL}/find-all-tokens`);
        if (!response.ok) {
          throw new Error(`Error fetching tokens: ${response.statusText}`);
        }
        const result = await response.json();
        setTokens(result.data.tokens || []);
      } catch (error) {
        console.error("Failed to fetch tokens:", error);
      }
    };

    fetchTokens();
  }, []);

  // Fetch devices by token
  const fetchDevicesForToken = async (tokenId, connectedDevices) => {
    setLoading(prev => ({ ...prev, [tokenId]: true }));
  
    try {
      const devicesData = await Promise.all(
        connectedDevices.map(async (deviceRef) => {
          if (!deviceRef || !deviceRef._id) {
            console.warn(`Invalid device reference:`, deviceRef);
            return null;
          }
    
          try {
            const response = await fetch(`${BACKEND_DEVICE_API_URL}/find-device-by-id?device_id=${deviceRef._id}`);
            
            if (!response.ok) {
              console.error(`Error fetching device ${deviceRef._id}. Status: ${response.status}`);
              return null;
            }
            
            const responseData = await response.json();
            
            // Extract the deviceRecord from the response
            const deviceData = responseData.data?.deviceRecord;
            
            if (!deviceData) {
              console.warn(`No device record found for ${deviceRef._id}:`, responseData);
              return null;
            }
            
            return deviceData;
          } catch (fetchError) {
            console.error(`Fetch error for device ${deviceRef._id}:`, fetchError);
            return null;
          }
        })
      );
  
      // Filter out null values
      const validDevices = devicesData.filter(device => device !== null);
  
      setDevices((prevDevices) => ({
        ...prevDevices,
        [tokenId]: validDevices,
      }));
    } catch (error) {
      console.error(`Complete failure fetching devices for token ${tokenId}:`, error);
    } finally {
      setLoading(prev => ({ ...prev, [tokenId]: false }));
    }
  };

  // Toggle dropdown and fetch devices if necessary
  const toggleDropdown = (tokenId, connectedDevices) => {
    setExpandedTokens((prevState) => ({
      ...prevState,
      [tokenId]: !prevState[tokenId],
    }));

    // Fetch devices if they haven't been loaded yet
    if (!devices[tokenId] && connectedDevices.length > 0) {
      fetchDevicesForToken(tokenId, connectedDevices);
    }
  };

  const disconnectDevice = async (macAddress, tokenId, deviceId) => {
    // Start loading for this specific device
    setDisconnectLoading(prev => ({
      ...prev,
      [deviceId]: true
    }));

    try {
      const response = await fetch(`${BACKEND_DEVICE_API_URL}/disconnect-device`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mac_address: macAddress })
      });

      if (!response.ok) {
        throw new Error(`Failed to disconnect device: ${response.statusText}`);
      }

      const result = await response.json();

      // Update the devices state to remove the disconnected device
      setDevices(prev => ({
        ...prev,
        [tokenId]: prev[tokenId].filter(device => device._id !== deviceId)
      }));

      // Optional: You might want to show a success message
      console.log('Device disconnected successfully:', result);
    } catch (error) {
      console.error('Disconnection error:', error);
      // Optional: Set an error state to show to the user
    } finally {
      // Stop loading for this device
      setDisconnectLoading(prev => ({
        ...prev,
        [deviceId]: false
      }));
    }
  };

  return (
    <div className="device-manager">
      <h1>Token and Device Manager</h1>
      <Link to="/">Back to Home</Link>
      <div className="tokens-list">
        {tokens.map((token) => (
          <div key={token._id} className="token-item">
            <div className="token-header">
              <div>
                <strong>Token:</strong> {token.token}
              </div>
              <div>
                <strong>Status:</strong>{" "}
                <span className={`status ${token.status}`}>{token.status}</span>
              </div>
              <div>
                <strong>Devices Connected:</strong>{" "}
                {token.devices_connected.length}
              </div>
              <button
                className="toggle-button"
                onClick={() =>
                  toggleDropdown(token._id, token.devices_connected)
                }
              >
                {expandedTokens[token._id] ? "Hide Devices" : "Show Devices"}
              </button>
            </div>

            {/* Dropdown for connected devices */}
            {expandedTokens[token._id] && (
              <div className="devices-dropdown">
                {loading[token._id] ? (
                  <div className="loading">Loading devices...</div>
                ) : devices[token._id] && devices[token._id].length > 0 ? (
                  devices[token._id].map((device) => (
                    <div key={device._id} className="device-item">
                      <div className="device-info">
                        <strong>Device ID:</strong> {device._id}
                        <br />
                        <strong>IP Address:</strong> {device.ip_address}
                        <br />
                        <strong>MAC Address:</strong> {device.mac_address}
                        <br />
                        <strong>Bandwidth:</strong> {device.bandwidth}
                        <br />
                        <strong>Connected At:</strong> {new Date(device.connected_at).toLocaleString()}
                      </div>
                      <button 
                        className="disconnect-button"
                        onClick={() => disconnectDevice(
                          device.mac_address, 
                          token._id, 
                          device._id
                        )}
                        disabled={disconnectLoading[device._id]}
                      >
                        {disconnectLoading[device._id] 
                          ? 'Disconnecting...' 
                          : 'Disconnect Device'}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="no-devices">No devices connected</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeviceManager;
