from librouteros import connect
from librouteros.exceptions import TrapError

# Koneksi ke MikroTik router
def connect_to_mikrotik():
    try:
        api = connect(username='admin', password='1234', host='192.168.88.1')
        return api
    except TrapError as e:
        print(f"Error: {e}")
        return None
    
#REHAN ANJING

# Memblokir atau mengubah status IP Binding pada Hotspot (MAC dan IP) jika sudah ada
def block_hotspot_user(api, mac_address, ip_address):
    try:
        # Cek apakah sudah ada binding dengan MAC atau IP yang sama
        bindings = api.path('ip/hotspot/ip-binding').select('id', 'mac-address', 'address', 'type')
        for binding in bindings:
            if binding.get('mac-address') == mac_address and binding.get('address') == ip_address:
                # Jika binding sudah ada, ubah statusnya menjadi 'blocked'
                api.path('ip/hotspot/ip-binding').set(id=binding.get('id'), type='blocked')
                print(f"Hotspot user with MAC {mac_address} and IP {ip_address} has been blocked (updated)!")
                return
        
        # Jika binding tidak ada, tambahkan sebagai 'blocked'
        api.path('ip/hotspot/ip-binding').add(
            **{'mac-address': mac_address, 'address': ip_address, 'type': 'blocked'}
        )
        print(f"Hotspot user with MAC {mac_address} and IP {ip_address} has been blocked (new)!")
    except TrapError as e:
        print(f"Error: {e}")

# Menambah IP Binding pada Hotspot
def add_hotspot_ip_binding(api, mac_address, ip_address, type_binding='bypassed'):
    try:
        api.path('ip/hotspot/ip-binding').add(
            **{'mac-address': mac_address, 'address': ip_address, 'type': type_binding}
        )
        print(f"Hotspot IP binding added successfully for MAC {mac_address} and IP {ip_address}!")
    except TrapError as e:
        print(f"Error: {e}")

# Menghapus IP Binding Hotspot berdasarkan MAC Address
def remove_hotspot_ip_binding(api, mac_address):
    try:
        # Cari binding berdasarkan MAC Address untuk mendapatkan ID
        bindings = api.path('ip/hotspot/ip-binding').select('id', 'mac-address')
        binding_id = None
        for binding in bindings:
            if binding.get('mac-address') == mac_address:
                binding_id = binding.get('id')
                break
        
        if binding_id:
            # Hapus binding berdasarkan ID
            api.path('ip/hotspot/ip-binding').remove(id=binding_id)
            print(f"Hotspot IP binding removed for MAC {mac_address}!")
        else:
            print(f"No IP binding found for MAC {mac_address}!")
    except TrapError as e:
        print(f"Error: {e}")

# Menambah firewall rule untuk Hotspot traffic
def add_hotspot_firewall_rule(api, src_address):
    try:
        api.path('ip/firewall/filter').add(
            chain='hs-auth',  # Chain untuk Hotspot yang sudah terautentikasi
            **{'src-address': src_address},
            action='accept'
        )
        print(f"Firewall rule added for Hotspot traffic from {src_address}!")
    except TrapError as e:
        print(f"Error: {e}")

# Mendapatkan daftar IP Binding pada Hotspot
def get_hotspot_ip_bindings(api):
    try:
        bindings = api.path('ip/hotspot/ip-binding').select('mac-address', 'address', 'type')
        for binding in bindings:
            mac_address = binding.get('mac-address', 'N/A')
            ip_address = binding.get('address', 'N/A')  # Menghindari KeyError dengan .get()
            binding_type = binding.get('type', 'N/A')
            print(f"MAC: {mac_address}, IP: {ip_address}, Type: {binding_type}")
    except TrapError as e:
        print(f"Error: {e}")

# Main function untuk mengelola fungsi lainnya
def main():
    api = connect_to_mikrotik()
    if api:
        print("Connection successful!")
        
        # Blokir atau update binding pengguna Hotspot (ubah menjadi blocked)
        block_hotspot_user(api, mac_address='1A:05:E6:17:B3:B3', ip_address='192.168.88.251')
        
        # Menambah Hotspot IP binding baru (bypass)
        add_hotspot_ip_binding(api, mac_address='1A:05:E6:17:B3:B3', ip_address='192.168.88.251', type_binding='bypassed')
        
        # Menambahkan firewall rule untuk Hotspot traffic
        add_hotspot_firewall_rule(api, '192.168.88.251')
        
        # Menampilkan daftar Hotspot IP Bindings
        get_hotspot_ip_bindings(api)

        # Menghapus Hotspot IP Binding
        remove_hotspot_ip_binding(api, '1A:05:E6:17:B3:B3')

if __name__ == "__main__":
    main()
