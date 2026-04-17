FROM python:3.10-slim AS builder

WORKDIR /app
COPY requirements.txt .
RUN pip install --user -r requirements.txt

FROM python:3.10-slim

WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY . .

# Update path for local pip installs
ENV PATH=/root/.local/bin:$PATH

# Create non-root user
RUN useradd -m workeruser
USER workeruser

CMD ["python", "main.py"]
