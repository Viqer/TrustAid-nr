# TrustAid Backend Architecture

## Overview

This is a production-style Node.js (Express) backend built with MongoDB, JWT authentication, role-based access control, and support for blockchain integration. The architecture follows clean code principles with modular, scalable design.

## Project Structure Explanation

```
backend/
├── config/                    # Configuration management
│   ├── database.js           # MongoDB connection with retry logic
│   └── env.js                # Environment variables validation
├── controllers/              # Business logic layer
│   ├── authController.js     # Authentication operations
│   ├── ngoController.js      # NGO management
│   ├── campaignController.js # Campaign operations
│   └── donationController.js # Donation tracking
├── models/                   # Data models (Schemas)
│   ├── User.js              # User schema
│   ├── Ngo.js               # NGO schema
│   ├── Campaign.js          # Campaign schema
│   └── Donation.js          # Donation schema
├── middleware/              # Express middleware
│   ├── auth.js              # JWT authentication
│   ├── roles.js             # Role-based access control
│   ├── validate.js          # Request validation
│   ├── errorHandler.js      # Centralized error handling
│   ├── rateLimit.js         # Rate limiting
│   └── asyncHandler.js      # Async route wrapper
├── routes/                  # API route definitions
│   ├── authRoutes.js        # Authentication endpoints
│   ├── ngoRoutes.js         # NGO endpoints
│   ├── campaignRoutes.js    # Campaign endpoints
│   └── donationRoutes.js    # Donation endpoints
├── server/                  # Server initialization
│   ├── app.js              # Express app setup
│   └── index.js            # Server startup
├── utils/                   # Utility functions and constants
│   ├── validationSchemas.js # Joi validation schemas
│   ├── constants.js         # Application constants
│   └── responseHelper.js    # Response formatting helpers
├── server.js                # Main entry point
├── package.json
├── .env.example             # Environment variables template
├── .gitignore
├── README.md               # API documentation
├── API_TESTING.md          # Testing guide
└── ARCHITECTURE.md         # This file
```

---

## Layer Architecture

### 1. **Entry Point** (`server.js`)
- Main file executed with `npm start` or `npm run dev`
- Delegates to `server/index.js`
- Handles process error catching

### 2. **Server Layer** (`server/`)
- **index.js**: Starts the server, initializes database connection
- **app.js**: Configures Express app, sets up middleware and routes

### 3. **Configuration Layer** (`config/`)
- **env.js**: Validates and exports environment variables
- **database.js**: MongoDB connection with retry logic and error handling

### 4. **Route Layer** (`routes/`)
- Defines API endpoints
- Applies validation and authentication middleware
- Routes requests to appropriate controllers
- Each route file handles one domain (auth, ngo, campaign, donation)

### 5. **Middleware Layer** (`middleware/`)
- **auth.js**: Verifies JWT tokens
- **roles.js**: Checks user role permissions
- **validate.js**: Validates request body with Joi
- **errorHandler.js**: Catches and formats errors
- **rateLimit.js**: Throttles requests per endpoint
- **asyncHandler.js**: Wraps async functions to catch errors

### 6. **Controller Layer** (`controllers/`)
- Handles HTTP request/response logic
- Calls model operations and business logic
- Returns standardized responses
- Delegates errors to error handler

### 7. **Model Layer** (`models/`)
- MongoDB schema definitions
- Data validation at DB level
- Instance methods (e.g., password comparison)
- Relationships between collections

### 8. **Utility Layer** (`utils/`)
- **validationSchemas.js**: Joi schemas for all endpoints
- **constants.js**: Enums and constants
- **responseHelper.js**: Response formatting utilities

---

## Data Flow

### Typical Request Flow

```
HTTP Request
    ↓
server.js (entry point)
    ↓
server/index.js (start server)
    ↓
server/app.js (Express app)
    ↓
routes/[route].js (match endpoint)
    ↓
middleware/validate.js (validate request)
    ↓
middleware/auth.js (verify token)
    ↓
middleware/roles.js (check permissions)
    ↓
controllers/[controller].js (handle logic)
    ↓
models/[model].js (database operations)
    ↓
MongoDB (persistence)
    ↓
Response (formatted)
    ↓
middleware/errorHandler.js (if error)
    ↓
HTTP Response (JSON)
```

---

## Authentication Flow

### Registration
1. Client sends email, password, name, and role
2. `authRoutes.js` validates input with Joi schema
3. `authController.register()` hashes password using bcryptjs
4. Creates new User document in MongoDB
5. Generates JWT token with user ID, email, and role
6. Returns user data and token

### Login
1. Client sends email and password
2. `authController.login()` finds user by email
3. Compares provided password with hashed password
4. Generates JWT token
5. Updates user's `lastLogin` timestamp
6. Returns user data and token

### Protected Route Access
1. Client includes JWT in Authorization header: `Bearer <token>`
2. `auth.js` middleware verifies JWT signature
3. Decodes token and attaches user to request object
4. `allowRoles()` middleware checks if user has required role
5. Controller processes request with user context

---

## Role-Based Access Control

### Roles
- **DONOR**: Can create donations, view campaigns
- **NGO**: Can create campaigns (after verification), apply as NGO
- **ADMIN**: Can verify NGOs, manage users

### Access Pattern
```javascript
// Public endpoint
router.get('/campaigns', campaignController.listCampaigns);

// Protected endpoint
router.post('/campaigns', auth, allowRoles('NGO'), campaignController.createCampaign);

// Admin only
router.patch('/ngos/:id/verify', auth, allowRoles('ADMIN'), ngoController.verifyNgo);
```

---

## Error Handling Strategy

### Error Types

**Validation Errors**
- Caught by `validate()` middleware
- Returns 400 with field-level error messages

**Authentication Errors**
- Caught by `auth()` middleware
- Returns 401 with "No token" or "Invalid token" message

**Authorization Errors**
- Caught by `allowRoles()` middleware
- Returns 403 with "Access denied" message

**Not Found Errors**
- Thrown as `AppError` in controllers
- Returns 404 with resource name

**Custom Errors**
- Thrown as `AppError` for business logic violations
- Example: "User already exists", "Campaign is not active"

**Database Errors**
- MongoDB validation errors
- Duplicate key errors
- Connection errors (handled in config/database.js)

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation message"
    }
  ]
}
```

---

## Middleware Chain

Requests flow through middleware in this order:

1. **CORS** - Cross-origin requests
2. **Body Parser** - JSON/URL-encoded parsing
3. **Rate Limiter** - Request throttling
4. **Route Handler**
   - Validation (`validate`)
   - Authentication (`auth`)
   - Authorization (`allowRoles`)
   - Controller
5. **404 Handler** - Unmatched routes
6. **Error Handler** - Exception catching

---

## Database Design

### Collections

**Users**
```
{
  email (unique),
  password (hashed),
  firstName, lastName,
  role (enum: DONOR, NGO, ADMIN),
  isVerified, phone, avatar,
  lastLogin, isActive,
  timestamps (createdAt, updatedAt)
}
```

**Ngos**
```
{
  userId (ref to User, unique),
  organizationName, registrationNumber (unique),
  description, website, phone, address,
  documentsMetadata,
  verificationStatus (enum: PENDING, VERIFIED, REJECTED),
  verificationNotes, verifiedBy, verifiedAt,
  isActive, timestamps
}
```

**Campaigns**
```
{
  ngoId (ref to NGO),
  title, description, longDescription,
  goalAmount, raisedAmount, currency,
  category (enum),
  status (enum: DRAFT, ACTIVE, COMPLETED, etc),
  isActive,
  startDate, deadline,
  image, tags,
  totalDonors, totalTransactions,
  timestamps
}
```

**Donations**
```
{
  amount, currency,
  campaignId (ref), ngoId (ref), donorId (ref),
  status (enum: PENDING, CONFIRMED, FAILED),
  blockchainTxHash (unique, sparse),
  blockNumber, network (enum),
  paymentMethod (enum),
  donorEmail, donorName, donorMessage,
  isAnonymous,
  timestamps
}
```

### Relationships
```
User (NGO) ──1──→ Ngo ──1──→ Campaign ──1──→ Donation ←──N─ User (Donor)
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Data retrieved",
  "data": {
    "items": [],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "total": 47,
      "limit": 10
    }
  }
}
```

---

## Validation

### Joi Schemas (utils/validationSchemas.js)

Centralized validation schemas for:
- **Auth**: register, login, refreshToken
- **NGO**: apply, uploadDocument, verify
- **Campaign**: create, update
- **Donation**: create, confirm

### Validation Middleware

```javascript
// Usage in routes
router.post('/endpoint', 
  validate(mySchema),
  controller
);

// Schema structure
const schema = Joi.object({
  field: Joi.string().required().messages({
    'any.required': 'Custom message'
  })
});
```

---

## Rate Limiting

### Limits
- **apiLimiter**: 100 requests per 15 minutes (all API routes)
- **authLimiter**: 5 requests per 15 minutes (login/register only)

### Applied To
```javascript
// Auth routes (stricter limit)
router.post('/login', authLimiter, controller);

// All other routes
app.use('/api/', apiLimiter);
```

---

## Best Practices Implemented

### Code Style
✅ Consistent naming conventions (camelCase for variables, PascalCase for classes)  
✅ Clear separation of concerns (controllers don't access DB directly)  
✅ Reusable validation schemas  
✅ Centralized error handling  

### Security
✅ Password hashing with bcryptjs  
✅ JWT token-based authentication  
✅ Role-based access control  
✅ Input validation with Joi  
✅ Rate limiting to prevent abuse  
✅ CORS configuration  

### Performance
✅ Database connection pooling (Mongoose default)  
✅ Indexes on frequently queried fields (email, registrationNumber, etc)  
✅ Paginated list endpoints  
✅ Lean queries where data projection helps  

### Reliability
✅ Database retry logic with exponential backoff  
✅ Comprehensive error handling  
✅ Unhandled promise rejection catching  
✅ Graceful shutdown handling  

### Maintainability
✅ Modular file structure  
✅ Consistent response format  
✅ Environment variable validation  
✅ Clear error messages  
✅ Documentation (README, API_TESTING, ARCHITECTURE)  

---

## Environment Variables

```bash
# Server
NODE_ENV=development
APP_HOST=localhost
APP_PORT=5000
FRONTEND_URL=http://localhost:3001

# Database
MONGODB_URI=mongodb://localhost:27017/trustaid

# Authentication
JWT_SECRET=your_secret_key
JWT_EXPIRY=7d

# Logging
LOG_LEVEL=debug
```

---

## Future Enhancements

### Phase 2
- [ ] Email notifications (nodemailer integration)
- [ ] File upload handling (AWS S3 or similar)
- [ ] WebSocket notifications in real-time
- [ ] Advanced filtering and search

### Phase 3
- [ ] Blockchain verification endpoint
- [ ] Payment gateway integration (Stripe, etc)
- [ ] Admin dashboard endpoints
- [ ] Analytics and reporting

### Phase 4
- [ ] GraphQL API
- [ ] Microservices architecture
- [ ] Caching layer (Redis)
- [ ] Message queue (RabbitMQ)

---

## Running Locally

```bash
# 1. Setup
npm install
cp .env.example .env
# Edit .env with your values

# 2. Start MongoDB
mongod

# 3. Run server
npm run dev

# 4. Test endpoints
# See API_TESTING.md for examples
```

---

## Deployment Considerations

### Environment
- Use strong, unique `JWT_SECRET` in production
- Set `NODE_ENV=production`
- Use production MongoDB URI

### Security
- Enable MongoDB authentication
- Use HTTPS only
- Set `FRONTEND_URL` to actual domain
- Implement rate limiting on production servers

### Scaling
- Use MongoDB replica sets
- Implement caching layer
- Use load balancer
- Consider microservices for independent scaling

---

For API documentation, see [README.md](./README.md)  
For testing guide, see [API_TESTING.md](./API_TESTING.md)
