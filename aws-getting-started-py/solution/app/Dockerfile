# Use AWS Lambda Python base image for ARM64
FROM public.ecr.aws/lambda/python:3.12-arm64

# Copy and install dependencies from original agent location
COPY language-tutor-agent/pyproject.toml ./
RUN pip install --no-cache-dir .

# Copy application code from original agent location
COPY language-tutor-agent/agent.py language-tutor-agent/tools.py language-tutor-agent/models.py ./

# Copy Lambda handler from solution
COPY solution/app/handler.py ./

# Set the Lambda handler
CMD ["handler.lambda_handler"]
