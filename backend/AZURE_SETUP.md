# Azure Services Setup Guide for ResQNet

**Complete step-by-step guide to configure all Azure services using your Microsoft Azure account**

## Prerequisites

- ✅ Microsoft Account (Azure account)
- ✅ Azure for Students subscription ($100 free credits) OR Azure free trial
- ✅ Access to [Azure Portal](https://portal.azure.com)

---

## 🚀 Quick Start Checklist

After completing each service setup, check it off:

- [ ] Azure OpenAI Service
- [ ] Azure Maps
- [ ] Azure Communication Services  
- [ ] Azure Application Insights
- [ ] Database (Cosmos DB or MongoDB Atlas)
- [ ] Environment Variables Configured

---

## 1️⃣ Azure OpenAI Service

**Purpose**: AI-powered emergency triage and severity assessment

### Setup Steps

#### Step 1.1: Create Azure OpenAI Resource

1. Login to [Azure Portal](https://portal.azure.com) with your Microsoft account
2. Click **"Create a resource"** (+ icon in top left)
3. Search for **"Azure OpenAI"**
4. Click **"Create"**

#### Step 1.2: Configure Resource

Fill in the following details:

| Field | Value |
|-------|-------|
| **Subscription** | Your Azure for Students subscription |
| **Resource Group** | Create new: `resqnet-resources` |
| **Region** | `East US` or `Sweden Central` (check availability) |
| **Name** | `resqnet-openai-[yourname]` (must be globally unique) |
| **Pricing Tier** | Standard S0 |

5. Click **"Review + Create"** → **"Create"**
6. Wait 2-3 minutes for deployment

#### Step 1.3: Deploy a Model

1. Go to your Azure OpenAI resource
2. Click **"Model deployments"** → **"Manage Deployments"** (opens Azure OpenAI Studio)
3. Click **"Create new deployment"**
4. Configure:
   - **Model**: `gpt-4` (or `gpt-35-turbo` if gpt-4 unavailable)
   - **Deployment name**: `gpt-4-deployment` (remember this!)
   - **Model version**: Latest
5. Click **"Create"**

#### Step 1.4: Get Credentials

1. Return to Azure Portal → Your OpenAI resource
2. Click **"Keys and Endpoint"** (left sidebar)
3. **Copy and save**:
   - ✏️ **Endpoint**: `https://resqnet-openai-yourname.openai.azure.com/`
   - ✏️ **Key 1**: `abc123...` (your API key)

#### Environment Variables to Add:

```env
AZURE_OPENAI_ENDPOINT=https://resqnet-openai-yourname.openai.azure.com/
AZURE_OPENAI_KEY=your_key_here
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4-deployment
```

---

## 2️⃣ Azure Maps

**Purpose**: Routing, distance calculation, ETA estimation

### Setup Steps

#### Step 2.1: Create Azure Maps Account

1. Azure Portal → **"Create a resource"**
2. Search for **"Azure Maps"**
3. Click **"Create"**

#### Step 2.2: Configure

| Field | Value |
|-------|-------|
| **Subscription** | Your Azure subscription |
| **Resource Group** | `resqnet-resources` (same as before) |
| **Name** | `resqnet-maps` |
| **Pricing Tier** | Gen2 (Pay-as-you-go, free tier available) |
| **Region** | Same as OpenAI |

4. Click **"Review + Create"** → **"Create"**

#### Step 2.3: Get Credentials

1. Go to your Azure Maps resource
2. Click **"Authentication"** (left sidebar)
3. **Copy and save**:
   - ✏️ **Primary Key**: `your_maps_subscription_key`

#### Environment Variables to Add:

```env
AZURE_MAPS_SUBSCRIPTION_KEY=your_maps_primary_key_here
```

---

## 3️⃣ Azure Communication Services

**Purpose**: SMS notifications to ambulances, hospitals, and patients

### Setup Steps

#### Step 3.1: Create Communication Services

1. Azure Portal → **"Create a resource"**
2. Search for **"Communication Services"**
3. Click **"Create"**

#### Step 3.2: Configure

| Field | Value |
|-------|-------|
| **Subscription** | Your Azure subscription |
| **Resource Group** | `resqnet-resources` |
| **Resource name** | `resqnet-comm` |
| **Data location** | United States (or your region) |

4. Click **"Review + Create"** → **"Create"**

#### Step 3.3: Get Connection String

1. Go to your Communication Services resource
2. Click **"Keys"** (left sidebar)
3. **Copy and save**:
   - ✏️ **Connection string**: `endpoint=https://...;accesskey=...`

#### Step 3.4: (Optional) Get a Phone Number for SMS

> **Note**: Phone numbers cost ~$1/month. For development, you can skip this and test without sending real SMS.

1. In your Communication Services resource, click **"Phone numbers"**
2. Click **"Get"** → **"Get a phone number"**
3. Select:
   - **Country**: United States (or your country)
   - **Number type**: Toll-free
   - **Capabilities**: Check "Send SMS"
4. Click **"Search"** → Select a number → **"Buy"**
5. **Copy and save** your phone number

#### Environment Variables to Add:

```env
AZURE_COMMUNICATION_CONNECTION_STRING=endpoint=https://resqnet-comm.communication.azure.com/;accesskey=your_key_here
AZURE_COMMUNICATION_PHONE_NUMBER=+1234567890
```

---

## 4️⃣ Azure Application Insights

**Purpose**: Logging, monitoring, application telemetry

### Setup Steps

#### Step 4.1: Create Application Insights

1. Azure Portal → **"Create a resource"**
2. Search for **"Application Insights"**
3. Click **"Create"**

#### Step 4.2: Configure

| Field | Value |
|-------|-------|
| **Subscription** | Your Azure subscription |
| **Resource Group** | `resqnet-resources` |
| **Name** | `resqnet-insights` |
| **Region** | Same as other resources |
| **Resource Mode** | Workspace-based (recommended) |

4. Click **"Review + Create"** → **"Create"**

#### Step 4.3: Get Credentials

1. Go to your Application Insights resource
2. Click **"Overview"** (top of page)
3. On the right side, you'll see "Essentials"
4. **Copy and save**:
   - ✏️ **Connection String**: `InstrumentationKey=...;IngestionEndpoint=...`
   - ✏️ **Instrumentation Key**: `abc-123-def...`

#### Environment Variables to Add:

```env
AZURE_APPLICATION_INSIGHTS_CONNECTION_STRING=InstrumentationKey=your-key;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/
AZURE_APPLICATION_INSIGHTS_INSTRUMENTATION_KEY=your_instrumentation_key
```

---

## 5️⃣ Database: Choose One Option

### Option A: Azure Cosmos DB (Recommended for Production)

**Pros**: Fully managed by Azure, scales automatically, MongoDB compatible  
**Cons**: Uses credits faster, minimum ~$24/month for production

#### Step A.1: Create Cosmos DB

1. Azure Portal → **"Create a resource"**
2. Search for **"Azure Cosmos DB"**
3. Click **"Create"** → Select **"Azure Cosmos DB for MongoDB"**

#### Step A.2: Configure

| Field | Value |
|-------|-------|
| **Subscription** | Your Azure subscription |
| **Resource Group** | `resqnet-resources` |
| **Account Name** | `resqnet-cosmosdb` |
| **Location** | Same region |
| **Capacity mode** | **Serverless** (free tier, perfect for development!) |
| **Version** | 4.2 or higher |

4. Click **"Review + Create"** → **"Create"** (takes 5-10 minutes)

#### Step A.3: Get Connection String

1. Go to your Cosmos DB resource
2. Click **"Connection String"** (left sidebar)
3. **Copy and save**:
   - ✏️ **Primary Connection String**: `mongodb://resqnet-cosmosdb:...@resqnet-cosmosdb.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=...`

#### Environment Variables to Add:

```env
MONGODB_URI=mongodb://resqnet-cosmosdb:KEY@resqnet-cosmosdb.mongo.cosmos.azure.com:10255/resqnet?ssl=true&retrywrites=false
```

---

### Option B: MongoDB Atlas (Recommended for Development)

**Pros**: FREE tier (512MB storage), no credit usage, easier setup  
**Cons**: Not integrated with Azure

#### Step B.1: Create MongoDB Atlas Account

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up with your email or Google account
3. Click **"Build a Database"**

#### Step B.2: Create Free Cluster

1. Select **"M0 FREE"** tier
2. Choose **Provider**: AWS, **Region**: Closest to you
3. **Cluster Name**: `resqnet-cluster`
4. Click **"Create"**

#### Step B.3: Setup Database Access

1. Click **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Create user:
   - **Username**: `resqnet_admin`
   - **Password**: Generate secure password (save it!)
   - **Database User Privileges**: Read and write to any database
4. Click **"Add User"**

#### Step B.4: Setup Network Access

1. Click **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development only!)
4. Click **"Confirm"**

#### Step B.5: Get Connection String

1. Click **"Database"** (left sidebar)
2. Click **"Connect"** on your cluster
3. Select **"Connect your application"**
4. **Driver**: Node.js, **Version**: 5.5 or later
5. **Copy** connection string:
   - `mongodb+srv://resqnet_admin:<password>@resqnet-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority`
6. Replace `<password>` with your actual password
7. Add database name: `mongodb+srv://resqnet_admin:yourpassword@resqnet-cluster.xxxxx.mongodb.net/resqnet?retryWrites=true&w=majority`

#### Environment Variables to Add:

```env
MONGODB_URI=mongodb+srv://resqnet_admin:yourpassword@resqnet-cluster.xxxxx.mongodb.net/resqnet?retryWrites=true&w=majority
```

---

## 6️⃣ Configure Environment Variables

### Step 6.1: Create .env File

1. Navigate to `c:\Users\ganes\Desktop\ResQNet\backend\`
2. Copy `.env.example` to `.env`
3. Open `.env` in your editor

### Step 6.2: Fill in ALL Variables

Here's your complete `.env` template with all Azure credentials:

```env
# ============================================
# SERVER CONFIGURATION
# ============================================
NODE_ENV=development
PORT=5000
API_VERSION=v1

# ============================================
# DATABASE
# ============================================
# Choose ONE option (Cosmos DB or MongoDB Atlas)
MONGODB_URI=mongodb+srv://your_connection_string_here

# ============================================
# AUTHENTICATION & SECURITY
# ============================================
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long_random_string
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# ============================================
# AZURE OPENAI (AI Triage)
# ============================================
AZURE_OPENAI_ENDPOINT=https://resqnet-openai-yourname.openai.azure.com/
AZURE_OPENAI_KEY=your_openai_key_here
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4-deployment

# ============================================
# AZURE MAPS (Routing & ETA)
# ============================================
AZURE_MAPS_SUBSCRIPTION_KEY=your_maps_key_here

# ============================================
# AZURE COMMUNICATION SERVICES (SMS)
# ============================================
AZURE_COMMUNICATION_CONNECTION_STRING=endpoint=https://resqnet-comm.communication.azure.com/;accesskey=your_key
AZURE_COMMUNICATION_PHONE_NUMBER=+1234567890

# ============================================
# AZURE APPLICATION INSIGHTS (Monitoring)
# ============================================
AZURE_APPLICATION_INSIGHTS_CONNECTION_STRING=InstrumentationKey=your-key;IngestionEndpoint=https://...
AZURE_APPLICATION_INSIGHTS_INSTRUMENTATION_KEY=your_instrumentation_key

# ============================================
# CORS & SECURITY
# ============================================
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ============================================
# LOGGING
# ============================================
LOG_LEVEL=debug
```

### Step 6.3: Generate JWT Secret

Run this in PowerShell to generate a secure random secret:

```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

Copy the output and paste it as your `JWT_SECRET`.

---

## ✅ Verification Checklist

After completing all setups, verify:

### Azure Portal Check
- [ ] All 5 resources visible in `resqnet-resources` resource group
- [ ] Azure OpenAI model deployed successfully
- [ ] All resources show "Running" status

### Environment Variables Check
- [ ] `.env` file exists in backend folder
- [ ] All Azure endpoints and keys filled in
- [ ] Database connection string configured
- [ ] JWT secret generated (64+ characters)

### Cost Monitoring
- [ ] Navigate to Azure Portal → "Cost Management + Billing"
- [ ] Check current credit balance
- [ ] Set up budget alerts (optional but recommended)

---

## 💰 Cost Estimates (Azure for Students $100 Credit)

| Service | Free Tier | Development Cost | Production Cost |
|---------|-----------|------------------|-----------------|
| **Azure OpenAI** | N/A | ~$1-5/month | $10-50/month |
| **Azure Maps** | 1000 free transactions | Free-$1/month | $5-20/month |
| **Communication Services** | Free + SMS costs | $1-2/month | $5-15/month |
| **Application Insights** | 5GB free/month | Free | Free-$5/month |
| **Cosmos DB (Serverless)** | Pay per use | $5-10/month | $24+/month |
| **MongoDB Atlas** | **FREE (M0 tier)** | **$0** | $0-9/month |

**Recommendation**: Use MongoDB Atlas free tier during development to conserve Azure credits.

**Estimated Development Cost**: $7-18/month with MongoDB Atlas, $12-28/month with Cosmos DB

---

## 🆘 Troubleshooting

### Issue: "Azure OpenAI not available in my region"
**Solution**: Try these regions in order:
1. East US
2. Sweden Central
3. France Central
4. North Central US

### Issue: "Cannot create Azure OpenAI - Access denied"
**Solution**: Apply for Azure OpenAI access:
1. Visit [aka.ms/oai/access](https://aka.ms/oai/access)
2. Fill application form
3. Wait 1-2 business days for approval

### Issue: "Cosmos DB too expensive"
**Solution**: Use MongoDB Atlas free tier instead (Option B above)

### Issue: "Connection string not working"
**Solution**: 
- Check for typos in `.env`
- Ensure no extra spaces before/after values
- For MongoDB Atlas: Verify IP whitelist includes your IP
- For Cosmos DB: Ensure you copied the MongoDB connection string, not the readonly string

---

## 📞 Support

- **Azure Support**: [portal.azure.com/#blade/Microsoft_Azure_Support](https://portal.azure.com/#blade/Microsoft_Azure_Support)
- **Azure for Students**: [azure.microsoft.com/en-us/free/students](https://azure.microsoft.com/en-us/free/students)
- **MongoDB Atlas Support**: [mongodb.com/docs/atlas](https://www.mongodb.com/docs/atlas)

---

## 🎯 Next Steps

After completing this setup:

1. ✅ Verify all environment variables in `.env`
2. ✅ Run `npm install` in backend directory
3. ✅ Run `npm run seed` to populate database
4. ✅ Run `npm run dev` to start development server
5. ✅ Test endpoints using Postman or curl

**Once your backend is running, you're ready to test the full emergency response flow!** 🚀
