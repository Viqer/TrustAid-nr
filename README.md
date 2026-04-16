# TrustAid

**TrustAid** is a full-stack donation platform built for the Indian market,
enabling donors to contribute to verified NGOs via **UPI and card payments**.
Every donation is cryptographically logged on a blockchain ledger —
creating a publicly verifiable, tamper-proof audit trail without requiring
donors to hold or understand cryptocurrency.

> Payments through UPI and cards. Trust through blockchain.

---

## The Problem

Donation platforms in India suffer from a trust deficit. Donors have no way
to independently verify that their money reached the NGO, and no guarantee
that reported donation figures haven't been altered. Existing blockchain
donation platforms solve this with crypto — but crypto adoption in India
remains extremely low, creating a barrier for everyday donors.

## The Solution

TrustAid separates the payment layer from the trust layer:

- **Payment**: Donors use UPI or cards — familiar, instant, widely adopted
- **Trust**: Every successful transaction is logged as an immutable record
  on the blockchain, generating a transaction hash the donor can verify
  independently at any time

This means any Indian with a UPI ID can donate and receive cryptographic
proof of their contribution — no wallet, no crypto, no friction.

---

## Key Features

- NGO registration and admin verification
- Campaign creation and browsing
- Donations via UPI and card payment gateway
- Automatic blockchain logging on donation confirmation
- Transaction hash returned to donor as proof of payment
- Donor dashboard with full donation history and blockchain references
- Admin panel for NGO and campaign oversight

---

## Donation Flow

1. Donor selects a verified campaign
2. Initiates payment via UPI or card
3. On payment confirmation, backend stores the donation in MongoDB
4. Blockchain service logs an immutable transaction record
5. A transaction hash is generated and returned to the donor
6. Donor can verify the transaction independently via the hash

---

## Tech Stack

### Frontend
- React, JavaScript

### Backend
- Node.js, Express.js

### Database
- MongoDB

### Blockchain
- Ethereum (testnet) via **ethers.js**
- Used exclusively as an immutable logging layer — not for payments

### Payment
- UPI and card payments via payment gateway integration *(in progress)*

---

## Architecture

TrustAid uses a modular backend structure:

- `config/` – environment and DB configuration
- `controllers/` – request handling per module
- `middleware/` – auth, validation, error handling
- `models/` – MongoDB schemas
- `routes/` – REST API routes
- `services/blockchain/` – handles transaction logging to chain

### Core Modules

- Auth Service
- NGO Service
- Campaign Service
- Donation Service
- Blockchain Logging Service
- Admin Module

---

## Database Schema (Core)

**Users** — user_id, name, email, password_hash, role, created_at  
**NGOs** — ngo_id, user_id, org_name, reg_number, verification_status  
**Campaigns** — campaign_id, ngo_id, title, goal_amount, raised_amount, deadline, status  
**Donations** — donation_id, donor_id, campaign_id, amount, payment_method,
                 payment_status, tx_hash, created_at

---

## Comparable Platforms

| Platform     | Payments     | Blockchain | India-Focused |
|-------------|-------------|------------|---------------|
| GiveIndia   | UPI / Cards | ✗          | ✓             |
| Milaap      | UPI / Cards | ✗          | ✓             |
| Giveth      | Crypto only | ✓          | ✗             |
| **TrustAid**| **UPI / Cards** | **✓**  | **✓**         |

---

## Roadmap

- [x] Landing page
- [ ] Auth system (donor + NGO)
- [ ] Campaign module
- [ ] Payment gateway integration (UPI + cards)
- [ ] Blockchain logging service
- [ ] Donor dashboard with transaction hashes
- [ ] Admin verification panel
- [ ] Performance benchmarks and load testing

---

## Status

🚧 **Actively under development.**  
Core architecture and landing page are established.
Payment and blockchain modules are in progress.

---

## Installation

```bash
git clone https://github.com/Viqer/TrustAid-nr.git
cd TrustAid-nr
npm install
```

Environment variables required — see `.env.example` *(coming soon)*
