use actix_web::{web, App, HttpServer};

mod db;
mod models;
mod schema;
mod routes;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let pool = db::init_pool();

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(pool.clone()))
            .configure(routes::configure)
    })
    .bind(("0.0.0.0", 8080))?
    .run()
    .await
}
