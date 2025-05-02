
# Neon Covenant Cloudflare Deployment

This repository contains infrastructure as code (IaC) and automation for deploying Cloudflare Workers, DNS records, KV storage, and Durable Objects for messaging.neoncovenant.com.

## Included Features
- DNS Record provisioning
- Cloudflare Worker deployment
- KV Namespace setup
- Durable Object integration
- GitHub Actions CI/CD workflow
- .env secrets template

## Usage

### 1. Configure Secrets
Create a `.env` file (already included) or set GitHub secrets:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ZONE_ID`
- `CLOUDFLARE_ACCOUNT_ID`

### 2. Run Locally
```bash
terraform init
terraform apply
```

### 3. GitHub CI/CD
Push to `main` branch to trigger automated deployment via GitHub Actions.

---

Built for Neon Covenant by Plexi.
