# 🚀 GigFlow - Freelance Marketplace

GigFlow is a full-stack platform designed to connect clients and freelancers. It features real-time notifications, secure authentication, and a production-ready hiring workflow.

## 🔗 Project Links
- **Live Frontend:** https://gigflow-1-2m8k.onrender.com/
- **Live Backend:** https://gigflow-dzfl.onrender.com/
- **Loom Demo Video:** [Paste your Loom Video Link here]

## ✨ Core Features
- **Secure Authentication:** Implements JWT-based authentication using HTTP-only, Secure, and SameSite:None cookies for secure cross-site data transfer.
- **Real-Time Notifications:** Powered by Socket.io. Freelancers receive instant "Congratulations" toast notifications the moment a client hires them.
- **Optimized WebSocket Connection:** Configured with `polling` fallback for stable connections on Render.
- **Role-Based Access:** Distinct workflows for 'Clients' and 'Freelancers'.

## 🛠️ Technical Implementation
- **Frontend:** React, Tailwind CSS, Socket.io-client.
- **Backend:** Node.js, Express, Cookie-Parser, Socket.io.
- **Database:** MongoDB Atlas.

## 🧪 Testing the Platform
I have already posted sample gigs using the test account below. You can use these credentials to view bids and hire freelancers, or register your own client account to post new gigs.

* **Test Client:** `test1234@gmail.com` | **Password:** `test1234`
* **Custom Test:** You are also welcome to **register** your own account as a Client or Freelancer to test the full flow from scratch.

## 🔄 The Hiring Flow
1. **Post:** Client posts a Gig.
2. **Bid:** Freelancer views the Gig and submits a Bid.
3. **Hire:** Client visits `View Bids`, reviews the list (fetched via `/api/bids/gig/:id`), and clicks **Hire**.
4. **Notify:** Backend updates the database and emits a Socket.io notification.
5. **Success:** Freelancer receives a real-time toast notification instantly.

## 🚀 Local Installation
1. **Clone the repository:**
   ```bash
   git clone [https://github.com/DIVYA-KAREGAONKAR/gigflow](https://github.com/DIVYA-KAREGAONKAR/gigflow)
   cd gigflow