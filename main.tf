
terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

variable "cloudflare_api_token" {}
variable "zone_id" {}
variable "account_id" {}

resource "cloudflare_record" "verify_dns" {
  zone_id = var.zone_id
  name    = "api-verification"
  type    = "TXT"
  value   = "verified-by-plexi"
  ttl     = 300
  proxied = false
}

resource "cloudflare_worker_script" "neon_worker" {
  name    = "neoncovenant-messaging"
  content = file("${path.module}/worker/index.js")
}

resource "cloudflare_workers_kv_namespace" "kv" {
  title = "neonKV"
}

resource "cloudflare_workers_durable_object_namespace" "neon_do" {
  name        = "SessionStore"
  script_name = cloudflare_worker_script.neon_worker.name
  class_name  = "SessionStore"
}

resource "cloudflare_worker_route" "api_route" {
  zone_id     = var.zone_id
  pattern     = "messaging.neoncovenant.com/*"
  script_name = cloudflare_worker_script.neon_worker.name
}
