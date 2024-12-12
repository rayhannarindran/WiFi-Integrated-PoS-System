import os
from flask import Flask, request, jsonify
from librouteros import connect
from librouteros.exceptions import TrapError
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)

# MikroTik connection settings
HOST = os.getenv('MIKROTIK_HOST')
USER = os.getenv('MIKROTIK_USER')
PASSWORD = os.getenv('MIKROTIK_PASSWORD')

# Connect to the MikroTik Router
def connect_to_mikrotik():
    return connect(username=USER, password=PASSWORD, host=HOST)

# GETS ALL IP BINDINGS
@app.route('/get-ip-binding-ids', methods=['GET'])
def get_ip_binding_ids():
    try:
        api = connect_to_mikrotik()
        
        # Fetch all IP bindings
        bindings = api.path('ip/hotspot/ip-binding')#.select('.id', 'mac-address', 'ip-address', 'to-address', 'type')
        
        # Extract the IDs and associated information
        binding_info = [{
            'id': binding['.id'],
            'mac_address': binding.get('mac-address', ''),
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
        bindings = api.path('ip/hotspot/ip-binding').select('.id', 'mac-address','type')

        for binding in bindings:
            if binding['mac-address'] == mac_address:
                return jsonify({
                    "status": "found",
                    "mac_address": binding['mac-address'],
                    "type": binding['type']
                }), 200
        return jsonify({"status": "not found"}), 404
    except TrapError as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    
# Update the connection status of a device in IP Binding
@app.route('/update-device-status', methods=['POST'])
def update_device_status():
    data = request.json
    mac_address = data.get('mac_address')
    status = data.get('status')
    try:
        api = connect_to_mikrotik()
        bindings = api.path('ip/hotspot/ip-binding').select('.id', 'mac-address', 'type')
        for binding in bindings:
            if binding['mac-address'] == mac_address:
                binding_id = binding['.id']
                api.path('ip/hotspot/ip-binding').update(
                    **{'.id': binding_id, 'type': status}  # Update 'type' based on .id
                )
                return jsonify({"status": "success", "message": f"Device {mac_address} status updated to {status}"}), 200
        return jsonify({"status": "error", "message": f"No IP binding found for MAC address {mac_address}"}), 404
    except TrapError as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    
# Get bandwidth limit for a device using Simple Queues
@app.route('/get-all-bandwidth-limits', methods=['GET'])
def get_all_bandwidth_limits():
    try:
        api = connect_to_mikrotik()
        
        # Fetch all Simple Queues
        queues = api.path('queue/simple').select('.id', 'name', 'target', 'max-limit')
        
        # Extract the IDs and associated information
        queue_info = [{
            'id': queue['.id'],
            'name': queue['name'],
            'target': queue['target'],
            'max_limit': queue['max-limit']
        } for queue in queues]

        return jsonify({
            "status": "success",
            "message": f"Retrieved {len(queue_info)} Simple Queues",
            "data": queue_info
        }), 200
    
    except TrapError as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    except Exception as e:
        return jsonify({"status": "error", "message": f"An unexpected error occurred: {str(e)}"}), 500
    
# Get bandwidth limit for a device using Simple Queues
@app.route('/get-bandwidth-limit', methods=['GET'])
def get_bandwidth_limit():
    ip_address = request.args.get('ip_address')

    try:
        api = connect_to_mikrotik()
        queues = api.path('queue/simple').select('.id', 'name', 'target', 'max-limit')
        
        for queue in queues:
            if queue['target'].split('/')[0] == ip_address:
                return jsonify({
                    "status": "found",
                    "ip_address": queue['target'].split('/')[0],
                    "upload_limit": queue['max-limit'].split('/')[1],
                    "download_limit": queue['max-limit'].split('/')[0]
                }), 200
        return jsonify({"status": "not found"}), 404
    except TrapError as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# Set bandwidth limit for a device using Simple Queues
@app.route('/set-bandwidth-limit', methods=['POST'])
def set_bandwidth_limit():
    data = request.json
    ip_address = data.get('ip_address')
    download_limit = data.get('download_limit')
    upload_limit = data.get('upload_limit')
    
    if not ip_address:
        return jsonify({"status": "error", "message": "IP address is required"}), 400

    api = connect_to_mikrotik()

    if api is None:
        return jsonify({"status": "error", "message": "Failed to connect to MikroTik"}), 500

    try:
        # Check if a rule already exists for this IP
        queues = api.path('queue/simple').select('.id', 'name', 'target')
        existing_queue = next((q for q in queues if q['target'].split('/')[0] == ip_address), None)

        if existing_queue:
            # Update existing rule
            api.path('queue/simple').update(
                **{
                    '.id': existing_queue['.id'],
                    'max-limit': f"{upload_limit}/{download_limit}"
                }
            )
            message = f"Bandwidth limit updated for {ip_address}"
        else:
            # Add new rule
            api.path('queue/simple').add(
                name=f"{ip_address}_limit", 
                target=ip_address, 
                **{'max-limit': f"{upload_limit}/{download_limit}"}
            )
            message = f"Bandwidth limit set for {ip_address}"

        return jsonify({"status": "success", "message": message}), 200
    except TrapError as e:
        print(f"TrapError: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"status": "error", "message": f"An unexpected error occurred: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('MIKROTIK_PYTHON_API_PORT')))
