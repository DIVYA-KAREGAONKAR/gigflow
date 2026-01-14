# GigFlow - Freelance Marketplace

GigFlow is a full-stack platform designed to connect clients and freelancers. It features real-time notifications, secure authentication, and a production-ready hiring workflow.

## Project Links
- **Live Frontend:** [Paste your Frontend URL here]
- **Live Backend:** https://gigflow-dzfl.onrender.com
- **Loom Demo Video:** [Paste your Loom Video Link here]

## ✨ Core Features
- **Secure Authentication:** Implements JWT-based authentication using HTTP-only, Secure, and SameSite:None cookies to ensure secure cross-site data transfer between separate frontend and backend domains.
- **Real-Time Notifications:** Powered by Socket.io. Freelancers receive instant "Congratulations" toast notifications via `react-hot-toast` the moment a client hires them.
- **Optimized WebSocket Connection:** Configured with `polling` fallback and specific transport settings to ensure stable real-time connections on Render's infrastructure.
- **Role-Based Access:** Distinct workflows for 'Clients' (post gigs, manage bids) and 'Freelancers' (browse gigs, place bids).

## 🛠️ Technical Implementation
- **Frontend:** Built with React and Tailwind CSS. State managed via Hooks, and real-time UI updates powered by Socket.io-client.
- **Backend:** Node.js and Express.js server utilizing `cookie-parser` for secure token handling and `CORS` with credential support.
- **Database:** MongoDB Atlas for persistent storage of user profiles, gig listings, and bid history.

## 🚀 Local Installation

1. **Clone the repository:**
   ```bash
   git clone <your-github-repo-link>
   cd gigflow