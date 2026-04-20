FROM rasa/rasa-sdk:3.6.0

# Switch to root to install packages
USER root

# Copy requirements first (best practice for caching)
COPY requirements.txt /app/requirements.txt

# Install dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r /app/requirements.txt

# Copy your action code
COPY . /app/actions

# Set working directory
WORKDIR /app

# Switch back to non-root user (rasa-sdk best practice)
USER 1001

# Run the action server
CMD ["start", "--actions", "actions", "--port", "5055"]