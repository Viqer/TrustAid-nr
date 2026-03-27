# TrustAid

**TrustAid** is a decentralized donation platform that connects NGOs and communities in need with donors through a transparent and secure web-based system. The platform uses blockchain technology to log donation transactions, allowing donors to verify contributions and improving trust in the donation process.

---

## Overview

Traditional donation platforms often rely on centralized systems, where donors have limited visibility into how funds are used. TrustAid addresses this issue by combining a modern web application with blockchain-backed transaction logging.

The platform is designed from the **donor's perspective**, making it easy to:
- explore verified causes
- donate securely
- track donation history
- view blockchain transaction records

---

## Key Features

- NGO registration and verification
- Campaign creation and management
- Donor-focused campaign browsing
- Secure donation workflow
- Blockchain-based donation logging
- Donation tracking dashboard
- Admin verification and monitoring

---

## Problem Statement

Many donation systems lack transparency and accountability. Donors often cannot verify where their money goes, which reduces trust and participation. TrustAid solves this by recording donation activity on the blockchain and presenting it through a user-friendly interface.

---

## Objectives

- Build a platform that connects donors and NGOs
- Improve transparency in donation systems
- Record donations on blockchain for accountability
- Provide a secure and simple donor experience
- Reduce misuse of funds through verifiable records

---

## SDG Alignment

TrustAid primarily supports:

- **SDG 16** – Peace, Justice and Strong Institutions
- **SDG 1** – No Poverty
- **SDG 10** – Reduced Inequalities
- **SDG 17** – Partnerships for the Goals

---

## Tech Stack

### Frontend
- HTML
- CSS
- JavaScript
- React

### Backend
- Node.js
- Express.js

### Database
- MongoDB

### Blockchain
- Solidity
- Hardhat
- ethers.js

---

## Proposed Architecture

TrustAid follows a modular backend design with a microservices-inspired structure and event-driven donation processing.

### Backend Structure
- `config/` – database and environment configuration
- `controllers/` – request handling logic
- `middleware/` – authentication, validation, error handling
- `models/` – MongoDB schemas
- `routes/` – API routes
- `server/` – app and server entry point

### Core Modules
- Authentication Service
- NGO Service
- Campaign Service
- Donation Service
- Blockchain Service
- Admin Module

---

## Donation Flow

1. Donor browses and selects a campaign  
2. Donation request is sent to backend  
3. Donation is stored in MongoDB  
4. Blockchain service logs the transaction  
5. Transaction hash is generated  
6. Donor can track the donation in the dashboard  

---

## Database Schema

### Users
- `user_id`
- `name`
- `email`
- `password_hash`
- `role`
- `created_at`

### NGOs
- `ngo_id`
- `user_id`
- `org_name`
- `reg_number`
- `verification_status`
- `verified_at`

### Campaigns
- `campaign_id`
- `ngo_id`
- `title`
- `description`
- `category`
- `goal_amount`
- `raised_amount`
- `deadline`
- `status`
- `created_at`

### Donations
- `donation_id`
- `donor_id`
- `campaign_id`
- `amount`
- `status`
- `tx_hash`
- `network`
- `created_at`

---

## Similar Platforms

### India
- Donatekart
- GiveIndia
- Milaap
- Ketto

### International
- Giveth
- The Giving Block
- Binance Charity

TrustAid aims to combine the usability of traditional platforms with the transparency of blockchain-based systems.

---

## Future Enhancements

- Live donation analytics dashboard
- Wallet integration
- Smart contract automation
- NGO performance insights
- Notification and alert system
- Multi-language support

---

## Installation

- Note the above has been AI generated and is placeholder text.
  
### 1. Clone the repository
```bash


git clone https://github.com/your-username/trustaidnr.git
cd trustaid
