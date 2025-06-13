# snops-web API Server

This crate provides a lightweight Actix Web server for the experimental React
frontend located in `../web`. It exposes REST endpoints for managing users,
host metadata and audit logs. The server relies on Diesel with a PostgreSQL
backend and is intended to be a starting point for a more feature rich
administrative interface.

## Running

### Database Setup

Run Diesel migrations to create tables and seed a default admin user:

```bash
cd snops-web
diesel setup --database-url $DATABASE_URL
diesel migration run
```

### Starting the server

Create a `.env` file with a `DATABASE_URL` pointing at a PostgreSQL instance and
start the server with:

```bash
cargo run -p snops-web
```

The service listens on `0.0.0.0:8080` by default.
