import pandas as pd
import io

# Load the dataset
data = pd.read_csv('bot_detection_data.csv')

# Name of the log file to save metadata details
log_filename = 'metadata_logs.txt'

with open(log_filename, 'w', encoding='utf-8') as log_file:
    log_file.write("=== Dataset Metadata Log ===\n\n")
    
    # Write dataset shape
    log_file.write("1. Dataset Shape:\n")
    log_file.write(f"{data.shape}\n\n")
    
    # Write column names
    log_file.write("2. Column Names:\n")
    log_file.write(f"{list(data.columns)}\n\n")
    
    # Write data types of each column
    log_file.write("3. Data Types:\n")
    log_file.write(f"{data.dtypes}\n\n")
    
    # Write the first 5 rows (a quick preview)
    log_file.write("4. First 5 Rows:\n")
    log_file.write(f"{data.head()}\n\n")
    
    # Capture and write detailed info (like non-null counts)
    log_file.write("5. Detailed Dataset Info:\n")
    info_buffer = io.StringIO()
    data.info(buf=info_buffer)
    log_file.write(info_buffer.getvalue() + "\n")
    
    # Write statistical summary for numerical and object columns
    log_file.write("6. Statistical Summary:\n")
    log_file.write(f"{data.describe(include='all')}\n\n")
    
    # Write count of missing values per column
    log_file.write("7. Missing Values per Column:\n")
    log_file.write(f"{data.isnull().sum()}\n\n")
    
    # If there are numeric columns, write the correlation matrix
    numeric_data = data.select_dtypes(include=['number'])
    if numeric_data.shape[1] > 1:
        log_file.write("8. Correlation Matrix (Numeric Columns):\n")
        log_file.write(f"{numeric_data.corr()}\n")
        
print(f"Metadata log has been saved to '{log_filename}'. You can open this file with Notepad.")
