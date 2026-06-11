# Use a lightweight Python base image
FROM python:3.9-slim

# Create and switch to a new directory
WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy our app code
COPY app.py .

# Expose port 8080 to the outside world
EXPOSE 8080

# Run the Flask app
CMD ["python", "app.py"]
