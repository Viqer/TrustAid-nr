# TrustAid Backend - Node.js Express API

A production-style Node.js (Express) backend for a donation platform with MongoDB, JWT authentication, role-based access control, and blockchain integration support.

## Features

✅ **JWT Authentication** - Secure token-based authentication with refresh support  
✅ **Role-Based Access Control** - Support for DONOR, NGO, and ADMIN roles  
✅ **Request Validation** - Joi schema validation for all inputs  
✅ **Centralized Error Handling** - Consistent error responses across all endpoints  
✅ **Rate Limiting** - Protection against abuse with configurable limits  
✅ **Async/Await Pattern** - Modern async code with asyncHandler wrapper  
✅ **MongoDB Integration** - With automatic retry logic and connection management  
✅ **Blockchain Ready** - Donation tracking with blockchain transaction hashing  

## Project Structure

```
backend/
├── config/
│   ├── database.js      # MongoDB connection with retry logic
│   └── env.js           # Environment variable validation
├── controllers/
│   ├── authController.js      # Register, login, token refresh
│   ├── ngoController.js       # NGO application and verification
│   ├── campaignController.js  # Campaign CRUD operations
│   └── donationController.js  # Donation creation and tracking
├── models/
│   ├── User.js          # User schema (DONOR, NGO, ADMIN roles)
│   ├── Ngo.js           # NGO organization profile
│   ├── Campaign.js      # Fundraising campaigns
│   └── Donation.js      # Donation records with blockchain support
├── middleware/
│   ├── auth.js          # JWT verification middleware
│   ├── roles.js         # Role-based access control
│   ├── validate.js      # Request validation middleware
│   ├── errorHandler.js  # Central error handling
│   ├── rateLimit.js     # Rate limiting middleware
│   └── asyncHandler.js  # Async route wrapper
├── routes/
│   ├── authRoutes.js      # Authentication endpoints
│   ├── ngoRoutes.js       # NGO management endpoints
│   ├── campaignRoutes.js  # Campaign endpoints
│   └── donationRoutes.js  # Donation endpoints
├── server/
│   ├── app.js           # Express app configuration
│   └── index.js         # Server startup and DB connection
├── server.js            # Main entry point
├── package.json
└── .env.example         # Environment variables template
```

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required variables:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT signing (use a strong, random string)
- `APP_PORT` - Server port (default: 5000)
- `FRONTEND_URL` - Frontend origin for CORS

### 3. Start the Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

## API Endpoints

### Authentication (`/api/auth`)

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "DONOR"  // or "NGO"
}

Response: { success, data: { user, token }, message }
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response: { success, data: { user, token }, message }
```

#### Refresh Token
```
POST /api/auth/refresh-token
Content-Type: application/json

{
  "token": "expired_jwt_token"
}

Response: { success, data: { token }, message }
```

### NGO Management (`/api/ngos`)

#### Apply as NGO
```
POST /api/ngos/apply
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "organizationName": "Help International",
  "registrationNumber": "REG123456",
  "description": "We help people in need",
  "website": "https://helpintl.org",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}

Response: { success, data: { ngo, user }, message }
```

#### Get NGO Profile
```
GET /api/ngos/:ngoId

Response: { success, data: ngo, message }
```

#### Upload Document Metadata
```
PATCH /api/ngos/:ngoId/documents
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "documentType": "registration",  // or "taxExemption", "other"
  "fileName": "registration.pdf",
  "fileUrl": "https://storage.example.com/registration.pdf",
  "docType": "Certificate of Incorporation"  // optional, for "other"
}

Response: { success, data: ngo, message }
```

#### Verify NGO (Admin Only)
```
PATCH /api/ngos/:ngoId/verify
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "status": "VERIFIED",  // or "REJECTED"
  "notes": "Documents verified successfully"
}

Response: { success, data: ngo, message }
```

#### List NGOs
```
GET /api/ngos?status=PENDING&page=1&limit=10

Response: { success, data: { ngos, pagination }, message }
```

### Campaigns (`/api/campaigns`)

#### Create Campaign (NGO Only)
```
POST /api/campaigns
Authorization: Bearer <ngo_jwt_token>
Content-Type: application/json

{
  "title": "Emergency Fund Drive",
  "description": "Help us provide emergency relief",
  "longDescription": "Detailed description...",
  "goalAmount": 50000,
  "currency": "USD",
  "category": "DISASTER_RELIEF",
  "deadline": "2026-12-31T23:59:59Z",
  "image": "https://storage.example.com/campaign.jpg",
  "tags": ["urgent", "relief"]
}

Response: { success, data: campaign, message }
```

#### List Campaigns (Public)
```
GET /api/campaigns?page=1&limit=10&category=HEALTH&status=ACTIVE&search=relief&sortBy=raisedAmount

Query Parameters:
- category: HEALTH|EDUCATION|DISASTER_RELIEF|ENVIRONMENT|POVERTY|OTHER
- status: DRAFT|ACTIVE|PAUSED|COMPLETED|FAILED|CLOSED
- search: Search in title and description
- sortBy: createdAt|raisedAmount|goalAmount (default: createdAt)
- page: Page number (default: 1)
- limit: Items per page (default: 10)

Response: { success, data: { campaigns, pagination }, message }
```

#### Get Campaign Details
```
GET /api/campaigns/:campaignId

Response: { success, data: campaign, message }
```

#### Update Campaign (Campaign Creator Only)
```
PATCH /api/campaigns/:campaignId
Authorization: Bearer <ngo_jwt_token>
Content-Type: application/json

{
  "title": "Updated title",
  "description": "Updated description",
  "image": "https://storage.example.com/new-image.jpg"
}

Response: { success, data: campaign, message }
```

#### Close Campaign (Campaign Creator Only)
```
DELETE /api/campaigns/:campaignId
Authorization: Bearer <ngo_jwt_token>

Response: { success, data: campaign, message }
```

### Donations (`/api/donations`)

#### Create Donation (Donor Only)
```
POST /api/donations
Authorization: Bearer <donor_jwt_token>
Content-Type: application/json

{
  "amount": 100,
  "currency": "USD",
  "campaignId": "campaign_id",
  "paymentMethod": "CARD",  // or BANK_TRANSFER|CRYPTO|PAYPAL
  "donorMessage": "Keep up the great work!",
  "isAnonymous": false
}

Response: { success, data: { donation }, message }
```

#### Confirm Donation (Blockchain)
```
PATCH /api/donations/:donationId/confirm
Content-Type: application/json

{
  "blockchainTxHash": "0x1234...abcd",
  "blockNumber": 12345678,
  "network": "ETHEREUM",  // or POLYGON|BINANCE
  "status": "CONFIRMED"    // or FAILED
}

Response: { success, data: donation, message }
```

#### Get Donation Details
```
GET /api/donations/:donationId

Response: { success, data: donation, message }
```

#### Get My Donations (Donor Only)
```
GET /api/donations/me/donations?page=1&limit=10&status=CONFIRMED

Query Parameters:
- status: PENDING|CONFIRMED|FAILED
- page: Page number
- limit: Items per page

Response: { success, data: { donations, pagination }, message }
```

#### Get Campaign Donations (Public)
```
GET /api/donations/campaign/:campaignId/donations?page=1&limit=10

Response: { success, data: { donations, pagination }, message }
```

## Data Models

### User
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  role: Enum[DONOR, NGO, ADMIN],
  isVerified: Boolean,
  phone: String,
  avatar: String (URL),
  lastLogin: Date,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### NGO
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  organizationName: String,
  registrationNumber: String (unique),
  description: String,
  website: String,
  phone: String,
  address: {
    street, city, state, zipCode, country
  },
  documentsMetadata: {
    registrationDoc: { fileName, fileUrl, uploadedAt },
    taxExemptionDoc: { fileName, fileUrl, uploadedAt },
    otherDocs: Array
  },
  verificationStatus: Enum[PENDING, VERIFIED, REJECTED],
  verificationNotes: String,
  verifiedBy: ObjectId,
  verifiedAt: Date,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Campaign
```javascript
{
  _id: ObjectId,
  ngoId: ObjectId (ref: NGO),
  title: String,
  description: String,
  longDescription: String,
  goalAmount: Number,
  raisedAmount: Number,
  currency: Enum[USD, EUR, GBP, INR],
  category: Enum[HEALTH, EDUCATION, DISASTER_RELIEF, ENVIRONMENT, POVERTY, OTHER],
  status: Enum[DRAFT, ACTIVE, PAUSED, COMPLETED, FAILED, CLOSED],
  isActive: Boolean,
  startDate: Date,
  deadline: Date,
  image: String (URL),
  tags: Array[String],
  totalDonors: Number,
  totalTransactions: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Donation
```javascript
{
  _id: ObjectId,
  amount: Number,
  currency: Enum[USD, EUR, GBP, INR],
  campaignId: ObjectId (ref: Campaign),
  ngoId: ObjectId (ref: NGO),
  donorId: ObjectId (ref: User),
  status: Enum[PENDING, CONFIRMED, FAILED],
  blockchainTxHash: String (unique, sparse),
  blockNumber: Number,
  network: Enum[ETHEREUM, POLYGON, BINANCE],
  paymentMethod: Enum[CARD, BANK_TRANSFER, CRYPTO, PAYPAL],
  donorEmail: String,
  donorName: String,
  donorMessage: String,
  isAnonymous: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Middleware

### Authentication (`auth`)
Verifies JWT token from Authorization header and attaches user to request.

```javascript
// Usage
router.get('/protected', auth, controller);
```

### Role-Based Access (`allowRoles`)
Restricts access to specific user roles.

```javascript
// Usage
router.post('/admin-only', auth, allowRoles('ADMIN'), controller);
router.post('/ngo-action', auth, allowRoles('NGO'), controller);
```

### Validation (`validate`)
Validates request body against Joi schema.

```javascript
// Usage
router.post('/endpoint', validate(mySchema), controller);
```

### Error Handler (`errorHandler`)
Central error handling middleware. Must be registered last.

```javascript
app.use(errorHandler);
```

### Rate Limiting
- **apiLimiter**: 100 requests per 15 minutes
- **authLimiter**: 5 requests per 15 minutes (for login/register)

## Conventions

### Async/Await
All controllers use async/await with the asyncHandler wrapper:

```javascript
const myController = async (req, res, next) => {
  // Errors are automatically caught and passed to error handler
};
```

### Error Handling
Use AppError for consistent error responses:

```javascript
const { AppError } = require('../middleware/errorHandler');

throw new AppError('User not found', 404);
```

### Response Format
All responses follow this format:

```javascript
{
  success: Boolean,
  message: String,
  data: Object|Array  // Omitted for error responses
}
```

## Development

### Required Environment Variables

```bash
MONGODB_URI=mongodb://localhost:27017/trustaid
JWT_SECRET=your_secret_key
APP_PORT=5000
JWT_EXPIRY=7d
FRONTEND_URL=http://localhost:3001
```

### Testing Workflow

1. Register a user (DONOR or NGO)
2. Login to get JWT token
3. Use token in Authorization header for protected endpoints
4. Admin can verify NGOs
5. Verified NGOs can create campaigns
6. Donors can donate to campaigns

## Future Enhancements

- Email notifications
- Blockchain integration for verified transactions
- Document upload handler
- Payment gateway integration
- Dashboard analytics
- Advanced search and filtering
- Notification system
- User activity logging

## License

ISC

## Support

For issues or questions, please open an issue in the repository.
