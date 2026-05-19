FROM rasa/rasa:3.6.20

# Switch to root to install packages
USER root

# Copy requirements first
COPY requirements.txt /app/requirements.txt

# Install dependencies (if any are listed in requirements.txt)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r /app/requirements.txt

# Switch back to non-root user
USER 1001

# Set working directory
WORKDIR /app

# Copy application files (domain, config, credentials, endpoints, data, etc.)
COPY --chown=1001:1001 . /app

# Default command: run Rasa server
CMD ["run", "--enable-api", "--cors", "*", "--port", "5005"]

