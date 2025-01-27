# Use python3.10.12 image based on Debian Bullseye in slim variant as base img
FROM python:3.10.12-slim-bullseye

# Set env variable to unbuffer Python output, aiding in logging/debugging
ENV PYTHONBUFFERED=1

# Set env variable for project path
ENV PYTHONPATH=/app/srcs

# Define env variable for web service's port, commonly used in cloud services
ENV PORT=8080

# Set working directory within container to /app for subsequent commands
WORKDIR /app

# Copy entire current directory contents into container at /app
COPY . /app/

# Install netcat
RUN apt-get update && apt-get install -y netcat

# Copy wait-for-it.sh script into the container
COPY wait_for_db.sh /wait_for_db.sh

# Make the wait-for-it.sh script executable
RUN chmod +x /wait_for_db.sh

# Upgrade pip to ensure we have the latest version for installing dependencies
RUN pip install --upgrade pip

# Install dependencies from requirements.txt
RUN pip install -r requirements.txt

# Set command to run our web service using Gunicorn, binding it to 0.0.0.0 and the requirements
# CMD gunicorn srcs.transcendence.wsgi:application --bind 0.0.0.0:"${PORT}"

# Inform Docker that the container listens on the specified network port at runtime
EXPOSE ${PORT}

CMD ["/wait_for_db.sh"]
