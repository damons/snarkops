use diesel::table;

// Diesel schema definitions

// Users table
pub mod users {
    diesel::table! {
        users (id) {
            id -> Uuid,
            username -> Varchar,
            email -> Varchar,
            password_hash -> Varchar,
            created_at -> Timestamp,
        }
    }
}

// Hosts table
pub mod hosts {
    diesel::table! {
        hosts (id) {
            id -> Uuid,
            hostname -> Varchar,
            internal_ip -> Varchar,
            agent_version -> Nullable<Varchar>,
            created_at -> Timestamp,
        }
    }
}

// Audit log table
pub mod audit_logs {
    diesel::table! {
        audit_logs (id) {
            id -> Uuid,
            user_id -> Nullable<Uuid>,
            action -> Varchar,
            created_at -> Timestamp,
        }
    }
}

pub use self::audit_logs::dsl as audit_logs_dsl;
pub use self::hosts::dsl as hosts_dsl;
pub use self::users::dsl as users_dsl;

