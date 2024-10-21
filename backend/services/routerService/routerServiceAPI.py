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

# GETS ALL IP BINDINGS
@app.route('/get-ip-binding-ids', methods=['GET'])
def get_ip_binding_ids():
    try:
        api = connect_to_mikrotik()
        
        # Fetch all IP bindings
        bindings = api.path('ip/hotspot/ip-binding').select('.id', 'mac-address', 'address', 'to-address', 'type')
        
        # Extract the IDs and associated information
        binding_info = [{
            'id': binding['.id'],
            'mac_address': binding.get('mac-address', ''),
            'address': binding.get('address', ''),
            'to_address': binding.get('to-address', ''),
            'type': binding.get('type', '')
        } for binding in bindings]
        
        return jsonify({
            "status": "success",
            "message": f"Retrieved {len(binding_info)} IP binding entries",
            "data": binding_info
        }), 200
    
    except TrapError as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    except Exception as e:
        return jsonify({"status": "error", "message": f"An unexpected error occurred: {str(e)}"}), 500


# ADDS DEVICE TO IP BINDINGS
@app.route('/add-device', methods=['POST'])
def add_device_to_ip_binding():
    data = request.json
    mac_address = data.get('mac_address')
    try:
        api = connect_to_mikrotik()
        # Add device to IP Bindings with 'bypassed' or 'allowed' access
        api.path('ip/hotspot/ip-binding').add(
            **{
                'mac-address': mac_address,
                'type': 'bypassed',  # Bypassed to allow internet without authentication
            }
        )
        return jsonify({"status": "success", "message": f"Device {mac_address} added to IP Binding"}), 200
    except TrapError as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# REMOVES DEVICE FROM IP BINDINGS
@app.route('/remove-device', methods=['POST'])
def remove_device_from_ip_binding():
    data = request.json
    mac_address = data.get('mac_address')
    
    if not mac_address:
        return jsonify({"status": "error", "message": "MAC address is required"}), 400
    
    try:
        api = connect_to_mikrotik()
        
        # Fetch all IP bindings
        bindings = api.path('ip/hotspot/ip-binding').select('.id', 'mac-address')
        
        # Find the binding with the matching MAC address
        matching_binding = next((b for b in bindings if b['mac-address'].lower() == mac_address.lower()), None)
        
        if not matching_binding:
            return jsonify({"status": "error", "message": f"No IP binding found for MAC address {mac_address}"}), 404
        
        # Remove the found binding
        binding_id = matching_binding['.id']
        api.path('ip/hotspot/ip-binding').remove(matching_binding['.id'])
        
        return jsonify({"status": "success", "message": f"Device {mac_address} removed from IP Binding"}), 200
    
    except TrapError as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    except Exception as e:
        return jsonify({"status": "error", "message": f"An unexpected error occurred: {str(e)}"}), 500


# Check the connection status of a device in IP Binding
@app.route('/device-status', methods=['GET'])
def device_status():
    mac_address = request.args.get('mac_address')
    try:
        api = connect_to_mikrotik()
        bindings = api.path('ip/hotspot/ip-binding').get()
        for binding in bindings:
            if binding['mac-address'] == mac_address:
                return jsonify({
                    "status": "found",
                    "ip_address": binding.get('address', 'Not assigned'),
                    "type": binding['type']
                }), 200
        return jsonify({"status": "not found"}), 404
    except TrapError as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# Set bandwidth limit for a device using Simple Queues
@app.route('/set-bandwidth-limit', methods=['POST'])
def set_bandwidth_limit():
    data = request.json
    ip_address = data.get('ip_address')
    download_limit = data.get('download_limit', '2M')
    upload_limit = data.get('upload_limit', '1M')
    try:
        api = connect_to_mikrotik()
        # Set bandwidth limit via Simple Queues
        api.path('queue/simple').add(
            name=f"{ip_address}_limit", 
            target=ip_address, 
            max_limit=f"{download_limit}/{upload_limit}"
        )
        return jsonify({"status": "success", "message": f"Bandwidth limit set for {ip_address}"}), 200
    except TrapError as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# Set time limit for a device connection using IP Binding's 'uptime'
@app.route('/set-time-limit', methods=['POST'])
def set_time_limit():
    data = request.json
    mac_address = data.get('mac_address')
    time_limit = data.get('time_limit', '1h')  # Default to 1 hour
    try:
        api = connect_to_mikrotik()
        # Set time limit (uptime-limit) via IP Binding
        api.path('ip/hotspot/ip-binding').set(
            where={"mac-address": mac_address}, 
            uptime_limit=time_limit  # Set time limit (e.g., 1h for 1 hour)
        )
        return jsonify({"status": "success", "message": f"Time limit {time_limit} set for {mac_address}"}), 200
    except TrapError as e:
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4000)
