// Assuming 'connectButton' is the connect button in the HTML and 'qrData' holds the QR code token.
const connectButton = document.getElementById('connect-button');  // Connect button element

// Function to get the 'token' parameter from the URL
function getTokenFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('token');
}

// Retrieve the token from the URL
const qrData = getTokenFromURL();
const messageElement = document.getElementById('message');
const apiUrl = 'http://192.168.88.250:3001/api';

// Retrieve IP and MAC from HTML
const ipAddress = document.querySelector(".info p span").textContent.trim(); // Fetch IP from DOM
const macAddress = document.querySelectorAll(".info p span")[1].textContent.trim(); // Fetch MAC from DOM

// Function to check device registration status
async function checkDeviceStatus() {
    const interval = 5000; // Polling interval (5 seconds)
    let isRegistered = false;

    // Polling function
    async function pollDatabase() {
        console.log("Checking device registration in database...");
        try {
            const response = await fetch(`${apiUrl}/device/find-device?mac_address=${macAddress}`);
            if (response.ok) {
                const data = await response.json();
                console.log("Response from database:", data); // Debug response

                // Check if deviceRecord exists in the response
                if (data.data && data.data.deviceRecord) {
                    isRegistered = true;
                    console.log("Device detected in database!");
                    clearInterval(pollingInterval); // Stop the loop
                    // Redirect to success page
                    window.location.href = "https://www.google.com";
                } else {
                    console.log("Device not yet registered, retrying...");
                }
            } else {
                console.error(`API call failed with status: ${response.status}`);
            }
        } catch (error) {
            console.error("Error checking device status:", error);
        }
    }

    // Start polling with setInterval
    console.log("Starting polling...");
    const pollingInterval = setInterval(async () => {
        await pollDatabase();
    }, interval);

    // Optional: Stop polling after 1 minute to avoid infinite loop
    setTimeout(() => {
        if (!isRegistered) {
            clearInterval(pollingInterval);
            console.error("Timeout: Device not detected after 1 minute.");
            window.location.href = `error.html`;
        }
    }, 60000); // 1 minute timeout
}

// Main event listener for the connect button
connectButton.addEventListener("click", async function () {
    const loader = document.getElementById("loader");
    console.log("Token:", qrData);

    // Show loader and hide button
    loader.style.display = "block";
    this.style.display = "none";

    try {
        // Validate token
        const response = await fetch(`${apiUrl}/token/validate-token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate", // Avoid caching
                "Pragma": "no-cache", // Avoid caching
                "Expires": "0", // Avoid caching
            },
            body: JSON.stringify({ token: qrData }),
        });

        if (response.ok) {
            const data = await response.json();

            if (data.data.isValid) {
                console.log("Token validated successfully. Saving device information...");

                // Save device info to database
                try {
                    const responseDevice = await fetch(`${apiUrl}/device/connect-device`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Cache-Control": "no-cache, no-store, must-revalidate", // Avoid caching
                            "Pragma": "no-cache", // Avoid caching
                            "Expires": "0", // Avoid caching
                        },
                        body: JSON.stringify({
                            token: qrData,
                            ip_address: ipAddress,
                            mac_address: macAddress,
                        }),
                    });

                    if (responseDevice.ok) {
                        console.log("Device saved successfully. Starting polling...");
                        // Start polling to check if the device is in the database
                        checkDeviceStatus();
                    } else {
                        console.error("Failed to save device: ", await responseDevice.text());
                        window.location.href = `error.html`;
                    }
                } catch (error) {
                    console.error("Error saving device:", error);
                    window.location.href = `error.html`;
                }
            } else {
                console.error("Token validation failed.");
                window.location.href = `error.html`;
            }
        } else {
            console.error(`Token validation API call failed with status: ${response.status}`);
            window.location.href = `error.html`;
        }
    } catch (error) {
        console.error("Error validating token:", error);
        window.location.href = `error.html`;
    }
});
