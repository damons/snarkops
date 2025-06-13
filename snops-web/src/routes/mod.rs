use actix_web::web;

pub mod users;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(web::scope("/users").configure(users::configure));
}
