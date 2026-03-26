# API Testing Guide

This document provides quick examples to test the TrustAid API endpoints.

## Quick Start

1. **Setup Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT_SECRET
   ```

2. **Install & Run**
   ```bash
   npm install
   npm run dev
   ```

3. **Server Running**
   - The server will be available at `http://localhost:5000`
   - Health check: `GET http://localhost:5000/health`

---

## Testing Flow

### Step 1: Register Users

**Register as Donor:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "donor@example.com",
    "password": "DonorPass123",
    "firstName": "Jane",
    "lastName": "Donor",
    "role": "DONOR"
  }'
```

**Register as NGO:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ngo@example.com",
    "password": "NgoPass123",
    "firstName": "John",
    "lastName": "Organization",
    "role": "NGO"
  }'
```

Extract the JWT token from the response and use it in subsequent requests.

---

### Step 2: Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "donor@example.com",
    "password": "DonorPass123"
  }'
```

---

### Step 3: Apply as NGO

```bash
curl -X POST http://localhost:5000/api/ngos/apply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer NGO_TOKEN" \
  -d '{
    "organizationName": "Help International",
    "registrationNumber": "REG-2024-001",
    "description": "We provide humanitarian aid worldwide",
    "website": "https://helpintl.org",
    "phone": "+1-800-HELP",
    "address": {
      "street": "123 Main Street",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    }
  }'
```

Save the NGO ID from the response.

---

### Step 4: Verify NGO (Admin)

(First create an admin user or update user role in MongoDB)

```bash
curl -X PATCH http://localhost:5000/api/ngos/NGO_ID/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "status": "VERIFIED",
    "notes": "All documents verified"
  }'
```

---

### Step 5: Create Campaign

```bash
curl -X POST http://localhost:5000/api/campaigns \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer NGO_TOKEN" \
  -d '{
    "title": "Emergency Food Relief",
    "description": "Providing food to families in crisis",
    "longDescription": "We are raising funds to provide nutritious meals to 5000 families affected by the recent disaster.",
    "goalAmount": 100000,
    "currency": "USD",
    "category": "DISASTER_RELIEF",
    "deadline": "2026-12-31T23:59:59Z",
    "image": "https://example.com/campaign.jpg",
    "tags": ["urgent", "relief", "food"]
  }'
```

Save the Campaign ID from the response.

---

### Step 6: List Campaigns

```bash
curl -X GET 'http://localhost:5000/api/campaigns?category=DISASTER_RELIEF&status=ACTIVE'
```

---

### Step 7: Create Donation

```bash
curl -X POST http://localhost:5000/api/donations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer DONOR_TOKEN" \
  -d '{
    "amount": 500,
    "currency": "USD",
    "campaignId": "CAMPAIGN_ID",
    "paymentMethod": "CARD",
    "donorMessage": "Keep up the great work!",
    "isAnonymous": false
  }'
```

Save the Donation ID from the response.

---

### Step 8: Confirm Donation (Blockchain)

```bash
curl -X PATCH http://localhost:5000/api/donations/DONATION_ID/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "blockchainTxHash": "0x1234567890abcdef1234567890abcdef12345678",
    "blockNumber": 18500000,
    "network": "ETHEREUM",
    "status": "CONFIRMED"
  }'
```

---

### Step 9: Get Donor Donations

```bash
curl -X GET 'http://localhost:5000/api/donations/me/donations' \
  -H "Authorization: Bearer DONOR_TOKEN"
```

---

## Response Examples

### Success Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "...",
      "email": "donor@example.com",
      "firstName": "Jane",
      "role": "DONOR"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "\"email\" must be a valid email"
    }
  ]
}
```

---

## Useful Environment Variables

```bash
# .env for testing
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/trustaid_test
JWT_SECRET=your_secret_key_for_testing
APP_PORT=5000
FRONTEND_URL=http://localhost:3001
```

---

## API Endpoints Summary

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | /api/auth/register | ❌ | - | Register new user |
| POST | /api/auth/login | ❌ | - | Login user |
| POST | /api/auth/refresh-token | ❌ | - | Refresh JWT token |
| POST | /api/ngos/apply | ✅ | - | Apply as NGO |
| GET | /api/ngos | ❌ | - | List NGOs |
| GET | /api/ngos/:id | ❌ | - | Get NGO profile |
| PATCH | /api/ngos/:id/documents | ✅ | NGO | Upload documents |
| PATCH | /api/ngos/:id/verify | ✅ | ADMIN | Verify NGO |
| POST | /api/campaigns | ✅ | NGO | Create campaign |
| GET | /api/campaigns | ❌ | - | List campaigns |
| GET | /api/campaigns/:id | ❌ | - | Get campaign |
| PATCH | /api/campaigns/:id | ✅ | NGO | Update campaign |
| DELETE | /api/campaigns/:id | ✅ | NGO | Close campaign |
| POST | /api/donations | ✅ | DONOR | Create donation |
| GET | /api/donations/:id | ❌ | - | Get donation |
| GET | /api/donations/me/donations | ✅ | DONOR | My donations |
| GET | /api/donations/campaign/:id/donations | ❌ | - | Campaign donations |
| PATCH | /api/donations/:id/confirm | ❌ | - | Confirm donation |

---

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check MONGODB_URI in .env file
- Verify port (default 27017)

### JWT Token Invalid
- Token might be expired
- Check JWT_SECRET matches between .env and config
- Use /api/auth/refresh-token to get new token

### Rate Limit Error
- Auth endpoints: 5 requests per 15 minutes
- Other endpoints: 100 requests per 15 minutes
- Wait or restart the server

---

For more detailed API documentation, see [README.md](./README.md)
