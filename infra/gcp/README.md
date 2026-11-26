# GCP demo deployment

This Terraform deploys the existing application without changing its code or Docker files:

- Compute Engine regional Managed Instance Group
- VMs running the existing backend and frontend Dockerfiles
- External HTTP load balancer, with optional Google-managed HTTPS
- Cloud SQL for PostgreSQL using a private IP
- Single-zone database with automated backups disabled
- CPU autoscaling
- Demo seed data enabled on the backend

## Prerequisites

1. Install Terraform and the Google Cloud CLI.
2. Authenticate with `gcloud auth application-default login`.
3. Create a GCP project and enable billing.
4. Copy `terraform.tfvars.example` to `terraform.tfvars` and set `project_id`.

## Deploy

```powershell
terraform init
terraform plan
terraform apply
```

The HTTP URL and load-balancer IP are printed as outputs. If `domain_name` is set, point its DNS A record at that IP and wait for the managed certificate to become active before using HTTPS.

## Destroy

```powershell
terraform destroy
```

The database password is stored in Terraform state because this is a demo deployment. Do not commit `terraform.tfvars` or the Terraform state files.

