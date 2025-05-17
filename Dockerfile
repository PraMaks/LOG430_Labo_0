# Use the official Python image from Docker Hub
FROM python:3.12-slim

# Set the working directory in the container
WORKDIR /app

# Copy the local application files into the container
COPY main.py test_pytest.py ./

# Install pytest
RUN pip install --no-cache-dir pytest

# Default command to run tests
CMD ["pytest", "test_pytest.py"]