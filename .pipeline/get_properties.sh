#!/bin/bash

# Function to generate Tekton result paths from YAML properties
generate_tekton_result_paths() {
    local filename="$1"
    local main_key="$2"

    echo "Filename: $filename"
    echo "Main key: $main_key"

    # Use Python to parse the YAML file and extract key-value pairs
    python3 -c "
import yaml

with open('$filename', 'r') as file:
    data = yaml.safe_load(file)

def print_result_paths(data, main_key):
    for key, value in data.items():
        if isinstance(value, dict):
            print_result_paths(value, key)
        else:
            key_result_path = 'results.' + main_key.replace('.', '_') + '_' + key.replace('.', '_') + '.path'
            value_result_path = 'results.' + main_key.replace('.', '_') + '_' + key.replace('.', '_') + '.path'
            if isinstance(value, bool):
                value = str(value)  # Convert boolean to string
            print(key_result_path + ' = ' + str(value))

print_result_paths(data['$main_key'], '$main_key')
"
}

# Call the function with command-line arguments
generate_tekton_result_paths "$1" "$2"
