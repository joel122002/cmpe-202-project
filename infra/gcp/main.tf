locals {
  name            = "vacation-rental"
  frontend_origin = var.domain_name == "" ? "http://${google_compute_global_address.lb.address}" : "https://${var.domain_name}"
}

resource "google_project_service" "compute" {
  service            = "compute.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "sqladmin" {
  service            = "sqladmin.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "servicenetworking" {
  service            = "servicenetworking.googleapis.com"
  disable_on_destroy = false
}

resource "google_compute_network" "app" {
  name                    = "${local.name}-vpc"
  auto_create_subnetworks = false

  depends_on = [google_project_service.compute]
}

resource "google_compute_subnetwork" "app" {
  name          = "${local.name}-subnet"
  region        = var.region
  network       = google_compute_network.app.id
  ip_cidr_range = "10.10.0.0/24"
}

resource "google_compute_global_address" "private_service_range" {
  name          = "${local.name}-private-services"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.app.id
}

resource "google_service_networking_connection" "private_services" {
  network                 = google_compute_network.app.id
  service                = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_service_range.name]
  deletion_policy         = "REMOVE_PEERING"

  depends_on = [google_project_service.servicenetworking]
}

resource "google_compute_firewall" "load_balancer_to_app" {
  name    = "${local.name}-lb-to-app"
  network = google_compute_network.app.name

  direction     = "INGRESS"
  source_ranges = ["35.191.0.0/16", "130.211.0.0/22"]
  target_tags   = ["${local.name}-app"]

  allow {
    protocol = "tcp"
    ports    = ["5173", "8000"]
  }
}

resource "random_password" "database" {
  length  = 24
  special = false
}

resource "google_sql_database_instance" "app" {
  name             = "${local.name}-postgres"
  region           = var.region
  database_version = var.database_version
  deletion_protection = false

  settings {
    tier              = var.database_tier
    edition           = "ENTERPRISE"
    availability_type = "ZONAL"
    disk_type         = "PD_SSD"
    disk_size         = 10
    disk_autoresize   = false

    backup_configuration {
      enabled = false
    }

    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.app.id
    }
  }

  depends_on = [google_service_networking_connection.private_services]
}

resource "google_sql_database" "app" {
  name     = "vacation_rental"
  instance = google_sql_database_instance.app.name
}

resource "google_sql_user" "app" {
  name     = "vacation_rental"
  instance = google_sql_database_instance.app.name
  password = random_password.database.result
}

resource "google_compute_instance_template" "app" {
  name_prefix  = "${local.name}-"
  machine_type = var.machine_type
  tags         = ["${local.name}-app"]

  disk {
    boot         = true
    auto_delete  = true
    source_image = "projects/debian-cloud/global/images/family/debian-12"
    disk_size_gb = 20
    disk_type    = "pd-balanced"
  }

  network_interface {
    subnetwork = google_compute_subnetwork.app.id

    access_config {}
  }

  metadata_startup_script = templatefile("${path.module}/startup.sh.tftpl", {
    repository_url = var.repository_url
    database_host  = google_sql_database_instance.app.private_ip_address
    database_name  = google_sql_database.app.name
    database_user  = google_sql_user.app.name
    database_password = random_password.database.result
    frontend_origin = local.frontend_origin
    frontend_domain = var.domain_name
  })

  lifecycle {
    create_before_destroy = true
  }
}

resource "google_compute_region_instance_group_manager" "app" {
  name               = "${local.name}-mig"
  region             = var.region
  base_instance_name = local.name
  target_size        = var.desired_replicas

  distribution_policy_zones = [
    "${var.region}-a",
    "${var.region}-b",
    "${var.region}-c",
  ]

  version {
    instance_template = google_compute_instance_template.app.self_link
  }

  named_port {
    name = "frontend"
    port = 5173
  }

  named_port {
    name = "backend"
    port = 8000
  }

  update_policy {
    type                           = "PROACTIVE"
    minimal_action                = "REPLACE"
    max_surge_fixed               = 3
    max_unavailable_fixed         = 0
    replacement_method            = "SUBSTITUTE"
  }

  auto_healing_policies {
    health_check      = google_compute_health_check.backend.id
    initial_delay_sec = 120
  }
}

resource "google_compute_region_autoscaler" "app" {
  name   = "${local.name}-autoscaler"
  region = var.region
  target = google_compute_region_instance_group_manager.app.id

  autoscaling_policy {
    min_replicas    = var.min_replicas
    max_replicas    = var.max_replicas
    cooldown_period = 180

    cpu_utilization {
      target = 0.60
    }
  }
}

resource "google_compute_health_check" "frontend" {
  name = "${local.name}-frontend-health"

  http_health_check {
    port         = 5173
    request_path = "/"
  }
}

resource "google_compute_health_check" "backend" {
  name = "${local.name}-backend-health"

  http_health_check {
    port         = 8000
    request_path = "/health"
  }
}

resource "time_sleep" "health_checks_ready" {
  create_duration = "30s"

  depends_on = [
    google_compute_health_check.frontend,
    google_compute_health_check.backend,
  ]
}

resource "google_compute_backend_service" "frontend" {
  name                  = "${local.name}-frontend-backend"
  protocol              = "HTTP"
  port_name             = "frontend"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  health_checks         = [google_compute_health_check.frontend.id]

  depends_on = [time_sleep.health_checks_ready]

  backend {
    group = google_compute_region_instance_group_manager.app.instance_group
  }
}

resource "google_compute_backend_service" "backend" {
  name                  = "${local.name}-api-backend"
  protocol              = "HTTP"
  port_name             = "backend"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  health_checks         = [google_compute_health_check.backend.id]

  depends_on = [time_sleep.health_checks_ready]

  backend {
    group = google_compute_region_instance_group_manager.app.instance_group
  }
}

resource "google_compute_url_map" "app" {
  name            = "${local.name}-url-map"
  default_service = google_compute_backend_service.frontend.id

  path_matcher {
    name            = "api-and-frontend"
    default_service = google_compute_backend_service.frontend.id

    path_rule {
      paths   = ["/api/*"]
      service = google_compute_backend_service.backend.id
    }
  }

  host_rule {
    hosts        = ["*"]
    path_matcher = "api-and-frontend"
  }
}

resource "google_compute_global_address" "lb" {
  name = "${local.name}-lb-ip"
}

resource "google_compute_target_http_proxy" "http" {
  name    = "${local.name}-http-proxy"
  url_map = google_compute_url_map.app.id
}

resource "google_compute_global_forwarding_rule" "http" {
  name                  = "${local.name}-http"
  ip_address            = google_compute_global_address.lb.address
  port_range            = "80"
  target                = google_compute_target_http_proxy.http.id
  load_balancing_scheme = "EXTERNAL_MANAGED"
}

resource "google_compute_managed_ssl_certificate" "app" {
  count = var.domain_name == "" ? 0 : 1

  name = random_id.certificate[0].hex

  lifecycle {
    create_before_destroy = true
  }

  managed {
    domains = [var.domain_name]
  }
}

resource "random_id" "certificate" {
  count       = var.domain_name == "" ? 0 : 1
  byte_length = 4
  prefix      = "${local.name}-certificate-"

  keepers = {
    domain_name = var.domain_name
  }
}

resource "google_compute_target_https_proxy" "https" {
  count = var.domain_name == "" ? 0 : 1

  name             = "${local.name}-https-proxy"
  url_map          = google_compute_url_map.app.id
  ssl_certificates = [google_compute_managed_ssl_certificate.app[0].id]
}

resource "google_compute_global_forwarding_rule" "https" {
  count = var.domain_name == "" ? 0 : 1

  name                  = "${local.name}-https"
  ip_address            = google_compute_global_address.lb.address
  port_range            = "443"
  target                = google_compute_target_https_proxy.https[0].id
  load_balancing_scheme = "EXTERNAL_MANAGED"
}

