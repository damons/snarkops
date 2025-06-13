use actix_web::{get, post, web, HttpResponse, Responder};
use diesel::prelude::*;
use uuid::Uuid;

use crate::db::DbPool;
use crate::models::{NewUser, User};
use crate::schema::users::dsl::*;

#[get("")]
async fn list(pool: web::Data<DbPool>) -> impl Responder {
    let mut conn = pool.get().expect("pool");
    let result: QueryResult<Vec<User>> = users.load(&mut conn);
    match result {
        Ok(list) => HttpResponse::Ok().json(list),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

#[post("")]
async fn create(pool: web::Data<DbPool>, item: web::Json<NewUserPayload>) -> impl Responder {
    use chrono::Utc;

    let mut conn = pool.get().expect("pool");
    let new_user = NewUser {
        id: Uuid::new_v4(),
        username: &item.username,
        email: &item.email,
        password_hash: &item.password,
        created_at: Utc::now().naive_utc(),
    };
    let result: QueryResult<User> = diesel::insert_into(users)
        .values(&new_user)
        .get_result(&mut conn);
    match result {
        Ok(u) => HttpResponse::Ok().json(u),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

#[derive(serde::Deserialize)]
struct NewUserPayload {
    username: String,
    email: String,
    password: String,
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(list).service(create);
}
