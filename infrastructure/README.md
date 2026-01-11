# ResQNet Infrastructure

Azure infrastructure as code and deployment configurations.

## Azure Resources

### Resource Groups
- `resqnet-dev` - Development environment
- `resqnet-staging` - Staging environment
- `resqnet-prod` - Production environment

### Services Configuration

#### Compute
- Azure App Service (Backend API)
- Azure Functions (Serverless tasks)
- Azure Container Apps (Microservices)

#### AI & Cognitive
- Azure OpenAI (AI Triage)
- Azure Cognitive Services (Future enhancements)

#### Data & Storage
- Azure Cosmos DB (MongoDB API) - Primary database
- Azure Blob Storage - File storage
- Azure Cache for Redis - Session storage

#### Communication & Integration
- Azure Communication Services (SMS)
- Azure Service Bus (Message queue)
- Azure Event Grid (Event-driven architecture)

#### Monitoring & Security
- Azure Application Insights (APM)
- Azure Monitor (Logging)
- Azure Key Vault (Secrets management)
- Azure AD B2C (User authentication)

#### Networking
- Azure Maps (Routing & Geocoding)
- Azure Load Balancer
- Azure CDN (Static assets)

## Deployment

### Infrastructure as Code (Planned)

```bash
# Using Azure CLI
az deployment group create \
  --resource-group resqnet-dev \
  --template-file azuredeploy.json \
  --parameters azuredeploy.parameters.json

# Using Terraform
terraform init
terraform plan
terraform apply
```

### CI/CD Pipeline (Planned)

- **GitHub Actions** for automated deployments
- **Azure DevOps** for pipeline management
- **Environment-based deployments** (dev → staging → prod)

## Environments

| Environment | Backend URL | Database | Purpose |
|-------------|-------------|----------|---------|
| Development | http://localhost:5000 | Local MongoDB | Local testing |
| Staging | https://api-staging.resqnet.com | Cosmos DB (Serverless) | Pre-production testing |
| Production | https://api.resqnet.com | Cosmos DB (Provisioned) | Live system |

## Cost Management

- Azure Cost Management dashboards
- Budget alerts configured
- Resource auto-shutdown for dev environments
- Serverless pricing tier for low-traffic services

## Security

- All secrets in Azure Key Vault
- Network security groups (NSG) configured
- SSL/TLS certificates via Azure App Service
- Role-based access control (RBAC)

## Status

🚧 **Under Development** - Azure services configured manually, IaC templates pending.
