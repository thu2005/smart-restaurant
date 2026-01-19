# Metabase BI Integration Guide

This guide explains how to set up and use Metabase for Business Intelligence (BI) reporting in the Smart Restaurant project.

## 1. Overview
Metabase is an open-source business intelligence tool that lets you ask questions about your data and display answers in formats like bar charts, pie charts, tables, and dashboards.

We have integrated Metabase via Docker to allow you to visualize:
- Revenue trends
- Popular menu items
- Staff performance
- Operational efficiency

## 2. Starting Metabase
Metabase has been added to the project's `docker-compose.yml`.

To start it, simply run:
```bash
cd backend
docker-compose up -d
```

Wait a minute or two for the container to initialize. You can check the status with:
```bash
docker logs -f smart-restaurant-metabase
```

## 3. Accessing the Dashboard
Once running, open your browser and navigate to:
**http://localhost:3000**

You will see the "Welcome to Metabase" setup screen.

## 4. Connecting to the Database
Follow these steps to query your operational data:

1.  **Click "Let's get started"**.
2.  **Create your admin account** (enter your details).
3.  **Add your data**:
    Select **PostgreSQL** as the database type.
    
    Enter the following connection details (these match your internal Docker network settings):
    
    *   **Display name**: `Smart Restaurant Operational DB`
    *   **Host**: `postgres`
        *   *Note: Do NOT use `localhost` here, as Metabase is running inside a container and needs to reach the `postgres` container.*
    *   **Port**: `5432`
    *   **Database name**: `smart_restaurant`
    *   **Username**: `postgres`
    *   **Password**: `postgres123`
    
4.  **Click "Next"** and choose your usage data preferences.

## 5. Usage Tips
- **Explore Data**: Click "Browse Data" to see your tables (`User`, `Order`, `MenuItem`, etc.).
- **Ask Questions**: Use the "Ask a question" button to query data (e.g., "Sum of Total in Payments filtered by Status = COMPLETED").
- **Dashboards**: Organize your saved questions into a "Restaurant Admin Dashboard".

## 6. Embedding (Optional)
If you wish to embed these charts directly into the React frontend later:
1.  Go to Metabase Admin > Settings > Embedding.
2.  Enable "Embedding in other applications".
3.  Generate a public link or signed JWT matching your frontend application.
