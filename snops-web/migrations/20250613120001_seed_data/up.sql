INSERT INTO users (id, username, email, password_hash, created_at)
VALUES
    (gen_random_uuid(), 'admin', 'admin@example.com', 'password', NOW());

INSERT INTO hosts (id, hostname, internal_ip, agent_version, created_at)
VALUES
    (gen_random_uuid(), 'localhost', '127.0.0.1', NULL, NOW());
