output "load_balancer_ip" {
  value = google_compute_global_address.lb.address
}

output "http_url" {
  value = "http://${google_compute_global_address.lb.address}"
}

output "https_url" {
  value = var.domain_name == "" ? null : "https://${var.domain_name}"
}

output "database_name" {
  value = google_sql_database.app.name
}

output "database_user" {
  value = google_sql_user.app.name
}

output "database_password" {
  value     = random_password.database.result
  sensitive = true
}

