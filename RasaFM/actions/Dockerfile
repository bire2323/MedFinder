FROM rasa/rasa-sdk:3.6.0

# Switch to root to install packages
USER root

# Copy requirements first
COPY requirements.txt /app/requirements.txt

# Install dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r /app/requirements.txt

# Copy your action code to /app
COPY . /app

# Set working directory
WORKDIR /app

# Switch back to non-root user
USER 1001

# Run the action server
CMD ["start", "--actions", "actions", "--port", "5055"]
