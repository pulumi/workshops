# Use an official Python runtime as a parent image
FROM python:3-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any dependencies specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Uninstall pip after installing dependencies (remove vulns)
RUN python -m pip uninstall -y pip

# Expose the port the app runs on
EXPOSE 8888

# Run the Flask app
CMD ["flask", "--app", "chat_ui.py", "run", "--host", "0.0.0.0", "--port", "8888"]
