#!/usr/bin/env python3
import os
import json
import shutil
import re

# Configuration
SOURCE_DIR = '/home/ubuntu/cryptocurrency-logos/coins'
TARGET_DIR = '/home/ubuntu/crypto-logos-website/data/coins'
RESOLUTIONS = ['128x128', '32x32', '16x16']
SAMPLE_SIZE = 500  # Number of logos to include in the website (for performance)

def extract_crypto_name(filename):
    """Extract cryptocurrency name from filename by removing extension and numbers."""
    base_name = os.path.splitext(os.path.basename(filename))[0]
    # Try to find a name in the README.md file based on ID
    return base_name

def main():
    print("Processing cryptocurrency logos...")
    
    # Create data structure to hold crypto information
    crypto_data = []
    
    # Get list of all PNG files in 128x128 directory (as reference)
    png_files = []
    for filename in os.listdir(os.path.join(SOURCE_DIR, '128x128')):
        if filename.endswith('.png'):
            png_files.append(filename)
    
    # Sort files by numeric ID
    png_files.sort(key=lambda x: int(os.path.splitext(x)[0]) if os.path.splitext(x)[0].isdigit() else float('inf'))
    
    # Limit to sample size
    png_files = png_files[:SAMPLE_SIZE]
    
    # Process each file
    for filename in png_files:
        file_id = os.path.splitext(filename)[0]
        
        # Copy files for each resolution
        for resolution in RESOLUTIONS:
            source_path = os.path.join(SOURCE_DIR, resolution, filename)
            target_path = os.path.join(TARGET_DIR, resolution, filename)
            
            if os.path.exists(source_path):
                shutil.copy2(source_path, target_path)
            else:
                print(f"Warning: {source_path} not found")
        
        # Add to data structure
        crypto_data.append({
            "id": file_id,
            "name": extract_crypto_name(filename)
        })
    
    # Try to extract names from README.md
    try:
        readme_path = '/home/ubuntu/cryptocurrency-logos/README.md'
        with open(readme_path, 'r') as f:
            readme_content = f.read()
            
        # Create a mapping of IDs to names
        name_mapping = {}
        
        # Extract names from markdown links
        pattern = r'!\[(.*?)\]\(coins/16x16/(\d+)\.png\)'
        matches = re.findall(pattern, readme_content)
        
        for name, id_str in matches:
            name_mapping[id_str] = name
        
        # Update crypto data with names
        for crypto in crypto_data:
            if crypto['id'] in name_mapping:
                crypto['name'] = name_mapping[crypto['id']]
    except Exception as e:
        print(f"Error extracting names from README: {e}")
    
    # Save data to JSON file
    with open(os.path.join(TARGET_DIR, '..', 'crypto-logos-data.json'), 'w') as f:
        json.dump(crypto_data, f, indent=2)
    
    print(f"Processed {len(crypto_data)} cryptocurrency logos")
    print(f"Data saved to {os.path.join(TARGET_DIR, '..', 'crypto-logos-data.json')}")

if __name__ == "__main__":
    main()
