CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    password_hash VARCHAR NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE hosts (
    id UUID PRIMARY KEY,
    hostname VARCHAR NOT NULL,
    internal_ip VARCHAR NOT NULL,
    agent_version VARCHAR,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action VARCHAR NOT NULL,
    created_at TIMESTAMP NOT NULL
);
