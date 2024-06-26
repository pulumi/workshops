def fileUpload(event, context):
    file_data = event

    # Extract relevant information from the event
    bucket_name = file_data['bucket']
    file_name = file_data['name']
    file_size = file_data['size']

    # Perform desired operations on the uploaded file
    # For example, you can process the file, store metadata, or trigger other actions

    print(f"File uploaded: {file_name} in bucket: {bucket_name}")
    print(f"File size: {file_size} bytes")

    # Add your custom logic here

    # Return a response (optional)
    return "File processing completed"
