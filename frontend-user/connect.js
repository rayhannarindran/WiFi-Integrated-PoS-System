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

connectButton.addEventListener("click", async function () {
    const loader = document.getElementById("loader");
    const qrMessage = document.getElementById("qr-message");

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
                        console.log("Device saved successfully");
                    } else {
                        console.error("Failed to save device: ", await responseDevice.text());
                    }
                } catch (error) {
                    console.error("Error saving device:", error);
                }

                // Redirect to success page
                window.location.href = `https://www.google.com`;
            } else {
                // Redirect to invalid page
                window.location.href = `https://www.google.com`;
            }
        } else {
            console.error(`API call failed with status: ${response.status}`);
            // Redirect to error page
            window.location.href = `https://www.google.com`;
        }
    } catch (error) {
        console.error("Error validating token:", error);
        // Redirect to error page
        window.location.href = `https://www.google.com`;
    }
});
