# Prometheus & Grafana Monitoring Guide

This guide explains how to set up and use Prometheus and Grafana to monitor your Smart Restaurant backend performance.

## 1. Overview
- **Prometheus**: Collects metrics from your backend (e.g., response times, error rates).
- **Grafana**: Visualizes these metrics in beautiful dashboards.

## 2. Setup
The services are already added to `docker-compose.yml`.

### Start the Services
Run this in the `backend` directory:
```bash
docker-compose up -d
```

This will start:
- **Prometheus** on http://localhost:9090
- **Grafana** on http://localhost:3001

## 3. Configuration Steps

### Step 1: Verify Prometheus
1.  Go to **http://localhost:9090/targets**.
2.  You should see `smart-restaurant-backend` with state **UP**.
    - If it's DOWN, ensure your backend server is running (`npm run dev` or `node server.js`).

### Step 2: Configure Grafana
1.  Go to **http://localhost:3001**.
2.  **Login**:
    - Username: `admin`
    - Password: `admin` (you will be asked to change this).
3.  **Add Data Source**:
    - Click "Add your first data source".
    - Select **Prometheus**.
    - In the URL field, enter: `http://prometheus:9090` (Note: use container name `prometheus`, not localhost).
    - Click **"Save & Test"**. You should see "Data source is working".

### Step 3: Create Dashboard
1.  Click the **+** icon in the sidebar > **Dashboard**.
2.  **Add a new panel**.
3.  In the query field, try entering:
    - `http_request_duration_seconds_bucket`
    - Or specifically: `rate(http_request_duration_seconds_sum[1m]) / rate(http_request_duration_seconds_count[1m])` (Average response time).
4.  Switch visualization to "Time series" or "Bar chart".
5.  Click **Apply**.

## 4. Useful Metrics
The backend exposes the following default metrics at `http://localhost:5001/metrics`:
- `process_cpu_user_seconds_total`: CPU usage.
- `process_resident_memory_bytes`: Memory usage.
- `http_request_duration_seconds`: Custom histogram for API latency.

## 5. Troubleshooting
- **Prometheus can't connect**: Ensure `extra_hosts` is correctly set in docker-compose (for Windows/Mac) to allow Docker to talk to host localhost.
- **No data**: Make some API requests to your backend (refresh the app pages) to generate traffic.
