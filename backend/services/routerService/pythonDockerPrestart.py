import os
import shutil

# Define paths for the .env and default .env files
env_path = os.path.join(os.getcwd(), '.env')
default_env_path = os.path.join(os.getcwd(), 'default.env')

# Check if the .env file exists; if not, create it
if not os.path.exists(env_path):
    print(".env file not found. Creating a default .env file...")
    if os.path.exists(default_env_path):
        shutil.copy(default_env_path, env_path)
        print("Default .env file created successfully.")
    else:
        print("Error: .default.env file not found.")
else:
    print(".env file already exists. Skipping creation.")