# Online Zoo Backend API

Serverless backend for the **Online Zoo** student assignment, built with **AWS Lambda + API Gateway** using **AWS CDK** (TypeScript). Provides hardcoded mock data for pets, feedback, and cameras with JWT authentication and configurable error simulation.

## 🚀 Features

- **9 Lambda Functions** - Pure Lambda handlers (no frameworks)
- **REST API** - API Gateway with CORS support
- **JWT Authentication** - Stateless auth with Bearer tokens
- **Mock Data** - 28 pets, 24 feedback items, 28 cameras (all hardcoded)
- **Error Simulation** - Configurable 25% random error rate for frontend testing
- **Local Testing** - Test all endpoints before deployment
- **Infrastructure as Code** - Fully defined with AWS CDK

## 📋 Prerequisites

- **Node.js** 24.14.0+
- **AWS CLI** configured with credentials
- **AWS CDK** 2.x installed globally or via npx

## 🛠️ Installation

```bash
# Clone the repository
git clone https://github.com/AlreadyBored/online-zoo-be

# Install dependencies
npm install
```

## 🧪 Testing

Run Jest tests for all Lambda handlers and utilities:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

**Test Suite**: ✅ 12 test files with comprehensive coverage (3 utilities + 9 handlers)

## 📦 Deployment

### Option 1: Quick Deploy

```bash
# Synthesize CloudFormation template
CDK_DOCKER=stub npx cdk synth

# Deploy to AWS
CDK_DOCKER=stub npx cdk deploy
```

### Option 2: Bootstrap First (for new AWS accounts)

```bash
# Bootstrap CDK (first-time setup)
CDK_DOCKER=stub npx cdk bootstrap

# Deploy stack
CDK_DOCKER=stub npx cdk deploy
```

**Note**: Set `CDK_DOCKER=stub` to use local esbuild bundling (Docker not required).

### Deployment Output

After deployment, CDK will output:

```
Outputs:
OnlineZooStack.OnlineZooApiUrl = https://xxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/
OnlineZooStack.OnlineZooApiId = xxxxxxxx
```

Use the `OnlineZooApiUrl` as your backend API endpoint.

## 📖 API Documentation

### Base URL

```
https://xxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/
```

### Endpoints

| Method | Path | Auth | Error Sim | Description |
|--------|------|------|-----------|-------------|
| GET | `/` | No | No | API information |
| GET | `/pets` | No | Yes (25%) | All 28 pets (light format) |
| GET | `/pets/{id}` | No | Yes (25%) | Pet detail with coordinates |
| GET | `/feedback` | No | Yes (25%) | All 24 feedback items |
| GET | `/cameras` | No | Yes (25%) | All 28 camera entries |
| POST | `/auth/register` | No | No | Register user, return JWT |
| POST | `/auth/login` | No | No | Login with hardcoded users |
| GET | `/auth/profile` | Required | No | Decode JWT, return user |
| POST | `/donations` | Optional | Yes (25%) | Accept donation |

### Authentication

JWT Bearer token authentication:

```bash
# Login to get token
curl -X POST https://api-url/prod/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"admin","password":"admin!1"}'

# Use token for protected endpoints
curl https://api-url/prod/auth/profile \
  -H "Authorization: Bearer eyJhbGci..."
```

**Hardcoded Users** (for testing):
- `admin` / `admin!1`
- `john` / `john!1`
- `test` / `test!1`

### Example Requests

#### Get All Pets

```bash
curl https://api-url/prod/pets
```

Response:
```json
{
  "data": [
    {
      "id": 1,
      "name": "Lucas",
      "commonName": "Giant Panda",
      "description": "Native to central China..."
    }
  ]
}
```

#### Get Pet Detail

```bash
curl https://api-url/prod/pets/1
```

Response:
```json
{
  "data": {
    "id": 1,
    "commonName": "Giant Panda",
    "scientificName": "Ailuropoda melanoleuca",
    "latitude": "32.4279° N",
    "longitude": "114.1095° E",
    ...
  }
}
```

#### Register User

```bash
curl -X POST https://api-url/prod/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "login": "testuser",
    "password": "test!123",
    "name": "Test User",
    "email": "test@example.com"
  }'
```

Response:
```json
{
  "data": {
    "access_token": "eyJhbGci...",
    "user": {
      "login": "testuser",
      "name": "Test User",
      "email": "test@example.com"
    }
  },
  "message": "User registered successfully"
}
```

#### Submit Donation

```bash
curl -X POST https://api-url/prod/donations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "amount": 100,
    "petId": 1
  }'
```

Response:
```json
{
  "data": {
    "message": "Thank you for your donation of 100 to Lucas!",
    "donationId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

## 🏗️ Project Structure

```
online-zoo/
├── cdk/
│   ├── stack.ts                   # CDK stack (9 Lambdas + API Gateway)
│   └── deploy.ts                  # CDK app entry point
├── lambdas/
│   ├── common/
│   │   ├── types.ts               # TypeScript interfaces
│   │   ├── response.ts            # CORS response helpers
│   │   ├── response.test.ts       # Response helpers tests
│   │   ├── error-simulation.ts    # 25% error probability
│   │   ├── error-simulation.test.ts # Error simulation tests
│   │   ├── auth-utils.ts          # JWT sign/verify/extract
│   │   ├── auth-utils.test.ts     # Auth utilities tests
│   │   ├── test-helpers.ts        # Mock event helpers for tests
│   │   └── data/
│   │       ├── pets.ts            # 28 pets (light)
│   │       ├── details.ts         # 28 pet details (full)
│   │       ├── feedback.ts        # 24 feedback items
│   │       ├── cameras.ts         # 28 camera entries
│   │       └── users.ts           # 3 hardcoded users
│   ├── api-info/
│   │   ├── handler.ts             # GET /
│   │   └── handler.test.ts
│   ├── get-pets/
│   │   ├── handler.ts             # GET /pets
│   │   └── handler.test.ts
│   ├── get-pet-detail/
│   │   ├── handler.ts             # GET /pets/{id}
│   │   └── handler.test.ts
│   ├── get-feedback/
│   │   ├── handler.ts             # GET /feedback
│   │   └── handler.test.ts
│   ├── get-cameras/
│   │   ├── handler.ts             # GET /cameras
│   │   └── handler.test.ts
│   ├── auth-register/
│   │   ├── handler.ts             # POST /auth/register
│   │   └── handler.test.ts
│   ├── auth-login/
│   │   ├── handler.ts             # POST /auth/login
│   │   └── handler.test.ts
│   ├── auth-profile/
│   │   ├── handler.ts             # GET /auth/profile
│   │   └── handler.test.ts
│   └── donate/
│       ├── handler.ts             # POST /donations
│       └── handler.test.ts
├── jest.config.js                 # Jest configuration
├── jest.setup.js                  # Jest environment setup
├── package.json
├── tsconfig.json
└── README.md                      # This file
```

## ⚙️ Configuration

### Environment Variables (Lambda)

Set in `cdk/stack.ts`:

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET` | `online-zoo-super-secret-key-2024` | JWT signing secret |
| `JWT_EXPIRY` | `24h` | Token expiration time |
| `TEST_ERROR_PROBABILITY` | `0.25` | Error simulation rate (0.0-1.0) |

### Customization

**Change error rate**: Edit `TEST_ERROR_PROBABILITY` in `cdk/stack.ts`:

```typescript
environment: {
  JWT_SECRET: 'your-secret-key',
  JWT_EXPIRY: '24h',
  TEST_ERROR_PROBABILITY: '0.1', // 10% error rate
}
```

**Add new users**: Edit `lambdas/common/data/users.ts`:

```typescript
export const MOCK_USERS: MockUser[] = [
  { login: 'newuser', password: 'pass!123', name: 'New User', email: 'new@zoo.com' },
];
```

**Modify pets**: Edit data files in `lambdas/common/data/`:
- `pets.ts` - Light pet list (for GET /pets)
- `details.ts` - Full pet details (for GET /pets/{id})
- `cameras.ts` - Camera descriptions
- `feedback.ts` - User testimonials

## 🔒 Security Notes

- **JWT tokens** are stateless (no database/session storage)
- **Passwords** are compared in plaintext (acceptable for mock data)
- **CORS** is open to all origins (`*`) - tighten for production
- **Rate limiting** not implemented - add via API Gateway if needed
- **API key authentication** not enabled - consider for production

## 🐛 Troubleshooting

### CDK Deployment Issues

**Error: "Docker not available"**
```bash
# Solution: Use local esbuild
CDK_DOCKER=stub npx cdk deploy
```

**Error: "Unable to compile TypeScript"**
```bash
# Solution: Check TypeScript compilation
npm run build

# Check for errors in lambdas/
npx tsc --noEmit
```

### Lambda Function Errors

**Error: "JWT must be provided"**
- Ensure JWT_SECRET environment variable is set
- Check token format: `Bearer <token>`

**Error: "Pet with ID X not found"**
- Valid pet IDs are 1-28
- Use numeric IDs, not string slugs

### Local Testing Issues

**Error: "Cannot find module 'tsx'"**
```bash
# Use ts-node instead
npm run test:local
```

**Error: "npm permission errors"**
```bash
# Use nvm to manage Node versions
nvm use 24.14.0
```

## 📚 Reference Projects

This implementation is based on patterns from:

1. **shop-be** (`/Users/Maksim_Shylau/JS/shop-be/`)
   - Endpoint patterns
   - Error simulation strategy
   - Response format

2. **secret-santa/server** (`/Users/Maksim_Shylau/JS/secret-santa/server/`)
   - CDK + Lambda architecture
   - `NodejsFunction` bundling
   - API Gateway setup

## 📝 Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript |
| `npm run watch` | Watch mode compilation |
| `npm test` | Run Jest tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run cdk` | Run CDK commands |

## 🎯 Next Steps

1. ✅ **Testing complete** - All tests passing with Jest
2. ⏭️ **Deploy to AWS** - Run `CDK_DOCKER=stub npx cdk deploy`
3. ⏭️ **Test deployed API** - Use API Gateway URL
4. ⏭️ **Connect frontend** - Update frontend API URL
5. ⏭️ **Monitor logs** - Check CloudWatch for errors

## 📄 License

This is a student assignment project for educational purposes.

## 👤 Author

Maksim Shylau

---

**Built with AWS CDK + Lambda + TypeScript**
