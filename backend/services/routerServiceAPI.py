from flask import Flask, request, jsonify
from librouteros import connect
from librouteros.exceptions import TrapError

app = Flask(__name__)

# MikroTik connection settings
HOST = '192.168.88.1'
USER = 'admin'
PASSWORD = '1234'

# Connect to the MikroTik Router
def connect_to_mikrotik():
    return connect(username=USER, password=PASSWORD, host=HOST)

# Add a device to the Hotspot
@app.route('/add-device', methods=['POST'])
def add_device():
    data = request.json
    mac_address = data.get('mac_address')
    rate_limit = data.get('rate_limit', '2M/1M')  # Default to 2M/1M if not provided
    try:
        api = connect_to_mikrotik()
        # Add device with rate limit
        api.path('ip/hotspot/user').add(
            name=mac_address, 
            mac_address=mac_address, 
            rate_limit=rate_limit
        )
        return jsonify({"status": "success", "message": f"Device {mac_address} added with rate limit {rate_limit}"}), 200
    except TrapError as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# Remove a device from the Hotspot
@app.route('/remove-device', methods=['POST'])
def remove_device():
    data = request.json
    mac_address = data.get('mac_address')
    try:
        api = connect_to_mikrotik()
        api.path('ip/hotspot/user').remove(where={"mac-address": mac_address})
        return jsonify({"status": "success", "message": f"Device {mac_address} removed from Hotspot"}), 200
    except TrapError as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# Check the connection status of a device
@app.route('/device-status', methods=['GET'])
def device_status():
    mac_address = request.args.get('mac_address')
    try:
        api = connect_to_mikrotik()
        active_users = api.path('ip/hotspot/active').get()
        for user in active_users:
            if user['mac-address'] == mac_address:
                return jsonify({"status": "connected", "ip_address": user['address']}), 200
        return jsonify({"status": "not connected"}), 404
    except TrapError as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# Set bandwidth limit for a device
@app.route('/set-bandwidth-limit', methods=['POST'])
def set_bandwidth_limit():
    data = request.json
    ip_address = data.get('ip_address')
    download_limit = data.get('download_limit', '2M')
    upload_limit = data.get('upload_limit', '1M')
    try:
        api = connect_to_mikrotik()
        api.path('queue/simple').add(
            name=f"{ip_address}_limit", 
            target=ip_address, 
            max_limit=f"{download_limit}/{upload_limit}"
        )
        return jsonify({"status": "success", "message": f"Bandwidth limit set for {ip_address}"}), 200
    except TrapError as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# Set time limit for a device connection
@app.route('/set-time-limit', methods=['POST'])
def set_time_limit():
    data = request.json
    mac_address = data.get('mac_address')
    time_limit = data.get('time_limit', '1h')  # Default to 1 hour
    try:
        api = connect_to_mikrotik()
        api.path('ip/hotspot/user').set(
            where={"mac-address": mac_address}, 
            uptime_limit=time_limit
        )
        return jsonify({"status": "success", "message": f"Time limit {time_limit} set for {mac_address}"}), 200
    except TrapError as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4000)
