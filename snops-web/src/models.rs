use chrono::NaiveDateTime;
use diesel::prelude::*;
use uuid::Uuid;

use crate::schema::{audit_logs, hosts, users};

#[derive(Debug, Queryable, Identifiable)]
#[diesel(table_name = users)]
pub struct User {
    pub id: Uuid,
    pub username: String,
    pub email: String,
    pub password_hash: String,
    pub created_at: NaiveDateTime,
}

#[derive(Insertable)]
#[diesel(table_name = users)]
pub struct NewUser<'a> {
    pub id: Uuid,
    pub username: &'a str,
    pub email: &'a str,
    pub password_hash: &'a str,
    pub created_at: NaiveDateTime,
}

#[derive(Debug, Queryable, Identifiable)]
#[diesel(table_name = hosts)]
pub struct Host {
    pub id: Uuid,
    pub hostname: String,
    pub internal_ip: String,
    pub agent_version: Option<String>,
    pub created_at: NaiveDateTime,
}

#[derive(Insertable)]
#[diesel(table_name = hosts)]
pub struct NewHost<'a> {
    pub id: Uuid,
    pub hostname: &'a str,
    pub internal_ip: &'a str,
    pub agent_version: Option<&'a str>,
    pub created_at: NaiveDateTime,
}

#[derive(Debug, Queryable, Identifiable)]
#[diesel(table_name = audit_logs)]
pub struct AuditLog {
    pub id: Uuid,
    pub user_id: Option<Uuid>,
    pub action: String,
    pub created_at: NaiveDateTime,
}

#[derive(Insertable)]
#[diesel(table_name = audit_logs)]
pub struct NewAuditLog<'a> {
    pub id: Uuid,
    pub user_id: Option<Uuid>,
    pub action: &'a str,
    pub created_at: NaiveDateTime,
}

