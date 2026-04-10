# Escrow Bar - Decentralized Bounty Management Platform

[![Live Demo Website](https://img.shields.io/badge/🚀_Live_Demo_Website-3b82f6?style=for-the-badge)](https://bounty-hub-three.vercel.app)
[![Video Demo](https://img.shields.io/badge/🌐_Video_Demo-10b981?style=for-the-badge)](https://drive.google.com/file/d/1mYLZvda3funTpglnUib1QjDsQNsuykFs/view?usp=drive_link)

A **decentralized bounty management platform** built on the Algorand Testnet using AlgoKit.

It solves trust issues in freelance and hackathon-style bounty systems by introducing:

🔐 **On-chain escrow for every bounty**
💰 **Secure fund locking inside smart contracts**
⚖ **Transparent approval & payout logic**
📜 **Immutable state tracking**


## 🌟 What It Does

**Escrow Bar enables:**

🧑‍💻 **Creators** to post bounties with locked escrow funds  
👨‍🔧 **Workers** to submit work on-chain  
🔐 **Smart contract–secured** payout logic  
⚡ **Transparent and tamper-proof** fund management  

**Unlike traditional bounty platforms, funds are secured by an Algorand smart contract — eliminating trust issues between creators and contributors.**

## 🎯 Problem Statement

### RIFT Track: Build on Algorand


**Freelance bounty platforms today rely on centralized trust, leading to payment disputes, delayed settlements, and lack of transparency between creators and contributors.**

### Our Interpretation

Freelance and hackathon bounty systems suffer from:
- ❌ **Payment disputes** - Who paid whom?
- ❌ **Lack of transparency** - Centralized database
- ❌ **Manual verification** - No automated proof
- ❌ **Centralized control** - Platform owns the system
- ❌ **Trust issues** - Both parties at risk

### Our Solution

An Algorand **smart contract–powered bounty escrow system** that:

✅ Locks funds inside an **Application Account**  
✅ Verifies submission logic **on-chain**  
✅ Releases funds only when **conditions are satisfied**  
✅ Maintains transparent state via **blockchain**  
✅ Zero intermediaries between creator and worker


---

## � Live Links & Deployment

### 🌐 Live Frontend
**Your Live URL:** [Vercel URL](https://bounty-hub-three.vercel.app/)

### 🎥 Demo Video 
[Demo video URL](https://drive.google.com/file/d/1mYLZvda3funTpglnUib1QjDsQNsuykFs/view?usp=drive_link)

### 🎥 Demo Video (LinkedIn) 
[LinkedIn video URL](https://www.linkedin.com/posts/sohum-venkatadri-73aa8234b_algorand-algokit-blockchain-ugcPost-7430439403375964160-Sq1G/?utm_source=share&utm_medium=member_android&rcm=ACoAAFeLwZ4B0zh0FUHMnJoBy28zuwA5kY56Uzc)



### 🧾 Smart Contract (Testnet)

## Each new bounty generates a new App ID with its own escrow account.

| Item | Value |
|------|-------|
| **App ID** | `755780805` |
| **Network** | Algorand Testnet |
| **Explorer** | [View on Pera Explorer](https://testnet.explorer.perawallet.app/application/755780805) |
| **Framework** | AlgoKit + PyTeAL/Beaker |



---

## 📋 Problem Statement & Solution

### RIFT Track Selection
**Track:** Build on Algorand 
**Requirement:** Build a decentralized solution that meaningfully leverages Algorand blockchain beyond simple payments

### Problem Our Solution Addresses

**Traditional Bounty Platforms Have:**
- ❌ Payment disputes & trust issues
- ❌ Lack of transparency (centralized database)
- ❌ Manual verification processes
- ❌ High platform fees & centralized control
- ❌ Geographic & access restrictions

### How Escrow Bar Solves It

| Problem | Traditional | Escrow Bar |
|---------|-------------|-----------|
| **Fund Safety** | Platform holds funds | Smart contract escrow (on-chain) |
| **Verification** | Manual review | On-chain validation |
| **Transparency** | Centralized logs | Blockchain immutable records |
| **Trust** | Platform dependent | Cryptographically verified |
| **Speed** | Days | Minutes (atomic transactions) |
| **Control** | Platform decides | Smart contract executes code |

---

---

## 🏗️ Architecture Overview

### Smart Contract Layer (Algorand)

Built using:
- ✅ **AlgoKit** - Official Algorand development framework
- ✅ **PyTeAL / Beaker** - Python-based smart contract language
- ✅ **Deployed on Algorand Testnet** - App ID: 755780805

#### Contract Responsibilities

| Function | Purpose |
|----------|---------|
| `create_bounty()` | Locks escrow funds in Application Account |
| `claim()` | Worker claims bounty (can only claim once) |
| `submit_work()` | Worker submits completed work on-chain |
| `approve_work()` | Creator approves & releases payment |


#### On-Chain Storage

```
Global State
├── creator: Address      # Who created the bounty
├── worker: Address       # Who claimed the bounty  
├── amount: UInt64        # Bounty amount (microAlgos)
└── status: UInt64        # 0=Active, 1=Claimed, 2=Completed

Application Account
└── Holds escrow funds securely until approval
```

### Frontend Layer

Built using:
- **React + TypeScript** - Modern UI framework
- **Wallet Integration** - Pera Wallet / Defly / MyAlgo
- **Algorand JS SDK** - Direct Algod API calls
- **Atomic Transaction Grouping** - Secure multi-step transactions

#### User Flow

<img width="425" height="467" alt="Screenshot 2026-02-20 at 6 59 45 AM" src="https://github.com/user-attachments/assets/130b3167-dbe7-421d-973a-4b44b90a6d4c" />



### Transaction Flow

**Step 1: Bounty Creation**
```
Creator → Frontend → Build ApplicationCreateTxn
       → Sign with Wallet
       → Send to Blockchain
       → Extract App ID → Save to localStorage
```

**Step 2: Escrow Funding**
```
Creator → Frontend → Build PaymentTxn to App Account
       → Group with AppCall
       → Sign & Send
       → Funds locked in Application Account
```

**Step 3: Work Submission**
```
Worker  → Frontend → Opt-in to Application
       → Call claim() method
       → Updates on-chain state
```

**Step 4: Payment Release**
```
Creator → Frontend → Call approve()
       → Smart contract validates
       → Atomic transfer to worker
       → Payment complete ✅
```



## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18.X
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **State Management:** React Hooks
- **Wallet Integration:** @txnlab/use-wallet-react
- **UI Components:** Shadcn/ui
- **Icons:** Lucide React

### Smart Contracts
- **Language:** PyTEAL (Python Algorand Development Toolkit)
- **Framework:** Beaker
- **Compiler:** TEAL (Algorand Virtual Machine)
- **Contract Language Version:** TEAL v10

### Backend / Deployment
- **Framework:** AlgoKit (Algorand Kit)
- **Package Manager:** Poetry (Python)
- **Testing:** pytest
- **Network:** Algorand Testnet

### Blockchain
- **Network:** Algorand Testnet
- **SDK:** algosdk (TypeScript)
- **Node:** Algonode (https://testnet-api.algonode.cloud)

---

## 📦 Installation & Setup

### Prerequisites
- **Node.js** 16+ with npm/pnpm
- **Python** 3.10+ with Poetry
- **Pera Wallet** or **MyAlgo Wallet** browser extension

### Step 1: Clone Repository
```bash
git clone https://github.com/yourusername/bounty-hub.git
cd bounty-hub
```

### Step 2: Install Frontend Dependencies
```bash
cd projects/frontend
pnpm install
```

### Step 3: Install Smart Contract Dependencies
```bash
cd ../contracts
poetry install
```

### Step 4: Configure Environment Variables

**Frontend (.env.local):**
```bash
VITE_ALGOD_SERVER=https://testnet-api.algonode.cloud
VITE_ALGOD_TOKEN=
VITE_NETWORK=testnet
```

**Contracts (.env):**
```bash
ALGORAND_NETWORK=testnet
ALGORAND_NODE_SERVER=https://testnet-api.algonode.cloud
ALGORAND_INDEXER_SERVER=https://testnet-idx.algonode.cloud
```

### Step 5: Deploy Smart Contracts

```bash
cd contracts
# Compile contracts
poetry run python -m smart_contracts.bounty.deploy_config

# Deploy to Testnet
poetry run algokit deploy testnet
```


### Step 6: Start Frontend Development Server

```bash
cd ../frontend
pnpm dev
```

---

## 🎮 Usage Guide

### Creating a Bounty

## 📖 Usage Guide

### 👤 Creator Flow - Posting a Bounty

#### 1️⃣ Connect Wallet
```
1. Click "Connect Wallet"
2. Select Pera / Defly / MyAlgo
3. Approve connection
```

#### 2️⃣ Create Bounty
```
1. Click "+ Create Bounty" button
2. Fill in details:
   - Title: "Build token dashboard"
   - Description: "Create a React dashboard for token metrics"
   - Reward: "5" (ALGO)
   - Category: Backend
   - Difficulty: Hard
3. Click "Create Bounty"
```

#### 3️⃣ Transaction Signing (2 txns)
```
Pera Wallet Shows:

Transaction 1: Create Application
├── Sender: Your address
├── Creates new Bounty App
└── Cost: ~0 (platform fee)

Transaction 2: Fund Escrow
├── Sender: Your address
├── Receiver: Application Address
├── Amount: 5 + 0.1 (escrow funding) ALGO
└── Status: Locked until approval
```

#### 4️⃣ Bounty Live
```
✅ Bounty now appears in "All Bounties"
✅ Funds locked in Application Account
✅ Workers can now claim
✅ You see it in "My Bounties"
```

### 👨‍🔧 Worker Flow - Claiming & Submitting Work

#### 1️⃣ Find a Bounty
```
1. Click "All Bounties"
2. Browse available bounties
3. Click on bounty to see details
```

#### 2️⃣ Opt-in to Application
```
1. Click "Claim Bounty" button
2. Sign opt-in transaction
   └── Allows you to interact with smart contract
```

#### 3️⃣ Claim Bounty
```
1. Click "Claim" button
2. Sign claim transaction
   └── Updates on-chain: worker = your address
3. Bounty status: "Claimed" ✅
```

#### 4️⃣ Submit Work (Off-chain)
```
1. Develop the deliverable
2. Submit link/code to creator (via chat/email)
3. Wait for approval...
```

#### 5️⃣ Receive Payment
```
When Creator approves:
├── Smart contract validates approval
├── Funds transferred from App Account
├── Payment received in your wallet ✅
└── Transaction visible on Testnet Explorer
```

### 💰 Creator Flow - Approving & Releasing Payment

#### 1️⃣ Review Work
```
1. Go to "My Bounties"
2. Find bounty with status "Claimed"
3. Review work submission
```

#### 2️⃣ Approve & Release
```
1. Click "Approve & Release Payment"
2. Sign approval transaction
   └── Smart contract executes payout logic
3. Wait for confirmation (~10 seconds)
```

#### 3️⃣ Payment Complete
```
✅ Worker receives: Bounty amount
✅ Creator pays: Bounty + minimal fees
✅ Transaction visible on Testnet (App ID: 755780805)
```


### 🔍 Verifying on Blockchain

```
1. Go to Pera Explorer:
   https://testnet.explorer.perawallet.app/application/755780805

2. Look for:
   ├── Application Calls (claim, approve)
   ├── Payment Transactions (escrow funding)
   └── Global State (creator, worker, amount, status)

3. Verify:
   ✅ Escrow account holds funds
   ✅ Payment transferred on approval
   ✅ All transactions grouped atomically
```
---

## � Why This Project Meaningfully Uses Algorand

This project demonstrates blockchain use cases **beyond simple payments**:

### ✅ Smart Contract Escrow Management
```
Traditional:     Creator → Platform → Worker
Escrow Bar:       Creator → Smart Contract Account → Worker
                 (Funds locked until conditions met)
```

### ✅ Atomic Transaction Grouping
```
Multi-step logic executed atomically:
1. Verifyapproval condition
2. Transfer from escrow account
3. All succeed or all fail - no partial states
```

### ✅ On-Chain State Management
```
Global State (immutable record):
├── creator:  Who posted the bounty
├── worker:   Who claimed it
├── amount:   Bounty value
└── status:   Current state (Active → Claimed → Completed)
```

### ✅ Application Account Model
```
Each bounty gets its own app-controlled account:
├── Holds escrow funds securely
├── Only releases with creator approval
├── Can't be accessed by any single user
└── Transparent & verifiable on blockchain
```

### ✅ AlgoKit Framework Integration
```
Uses official Algorand toolkit:
✅ Smart contract scaffolding
✅ Deployment pipeline
✅ Testing framework
✅ LocalNet development
✅ Production deployment
```


| Aspect | Why Algorand Matters |
|--------|---------------------|
| **Escrow** | Smart contract enforces conditions, not platform |
| **Trust** | Cryptographic verification, not corporate policy |
| **Transparency** | Every transaction on immutable ledger |
| **Speed** | 4-second finality (vs. traditional 3-5 days) |
| **Cost** | $0.001 per transaction (vs. 20-30% platform fee) |
| **Ownership** | User controls their keys, not platform |



## �📸 Screenshots

### Home Page
<img width="1440" height="792" alt="Screenshot 2026-02-20 at 7 10 42 AM" src="https://github.com/user-attachments/assets/f548aab2-6498-4de5-a5fe-46a14772f24b" />


### Create Bounty Modal
<img width="1291" height="699" alt="Screenshot 2026-02-20 at 7 10 58 AM" src="https://github.com/user-attachments/assets/1a3291b3-d4d8-4dc1-9d45-cdc834afa10f" />


### All Bounties View
<img width="1440" height="792" alt="Screenshot 2026-02-20 at 7 11 16 AM" src="https://github.com/user-attachments/assets/40385396-7d11-4c1a-816a-68995a912840" />


### APP_ID on Explorer
<img width="1440" height="792" alt="Screenshot 2026-02-20 at 7 13 25 AM" src="https://github.com/user-attachments/assets/ea6ea0cc-8ab1-4340-b3ce-84577c26c06a" />




## 🚀 Deployment

### Deploying to Production

1. **Smart Contract Deployment:**
   ```bash
   cd projects/contracts
   # Deploy
   poetry run algokit deploy mainnet
   ```

2. **Frontend Deployment (Vercel):**
   ```bash
   cd projects/frontend
   pnpm run build
   # Connect GitHub repo to Vercel for automatic deploys
   ```

3. **Update Configuration:**
   - Update `.env` with Mainnet App ID
   - Update README with Mainnet links

---

## 👥 Team Members & Roles

| Name | Role | 
|------|------|
| Prajwal G | Smart Contract & Backend |
| Pooja Kumari | Frontend | 
| Rakshith C | Frontend | 
| Sohum Venkatadri | Smart Contract | 

---

## 📄 License

This project is licensed under the **MIT License** - see [LICENSE](./LICENSE) file for details.

---
