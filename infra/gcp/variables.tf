variable "project_id" {
  description = "GCP project ID."
  type        = string
}

variable "region" {
  description = "GCP region for the regional MIG and Cloud SQL."
  type        = string
  default     = "us-west1"
}

variable "zone" {
  description = "GCP zone used by the regional MIG."
  type        = string
  default     = "us-west1-a"
}

variable "repository_url" {
  description = "Git repository cloned by each VM at startup."
  type        = string
  default     = "https://github.com/joel122002/cmpe-202-project.git"
}

variable "domain_name" {
  description = "Optional DNS name for a Google-managed HTTPS certificate. Leave empty for HTTP only."
  type        = string
  default     = ""
}

variable "min_replicas" {
  type    = number
  default = 1
}

variable "desired_replicas" {
  type    = number
  default = 1
}

variable "max_replicas" {
  type    = number
  default = 2
}

variable "machine_type" {
  type    = string
  default = "e2-medium"
}

variable "database_tier" {
  type    = string
  default = "db-f1-micro"
}

variable "database_version" {
  type    = string
  default = "POSTGRES_15"
}

