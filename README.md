# 🤖 InterviewIQ.AI — AI-Powered Mock Interview Platform

An intelligent, full-stack MERN mock interview platform that analyzes candidate resumes, conducts adaptive AI-driven interviews, scores responses across multiple dimensions, and generates actionable performance reports.

🔗 **Live Demo:** [https://ai-interview-client-gx0c.onrender.com](https://ai-interview-client-gx0c.onrender.com)  
⚙️ **Backend API:** [https://ai-interview-fevz.onrender.com](https://ai-interview-fevz.onrender.com)

---

## ✨ Key Features

- **Smart Resume Parsing:** Upload a PDF resume (`pdf-parse-new`) to automatically extract target roles, experience levels, projects, and technical skills.
- **Tailored AI Question Generation:** Generates 5 progressive interview questions (Easy → Medium → Hard) personalized to the candidate's resume, role, and selected interview mode via OpenRouter AI.
- **Real-Time Answer Evaluation:** Evaluates submitted answers with strict time limits and scores each response across **Confidence**, **Communication**, and **Correctness** (0–10 scale) alongside concise, human-like feedback.
- **Comprehensive Performance Reports & History:** Tracks past mock interviews, displays question-by-question breakdowns, and calculates overall performance metrics.
- **Credit-Based Usage & Razorpay Payments:** Integrated Razorpay checkout (`/order` & `/verify` with HMAC SHA256 signature verification) allowing users to purchase interview credits securely.
- **Google OAuth & JWT Session Management:** Seamless Google Sign-In powered by Firebase Authentication, paired with HTTP-only, cross-site secure JWT cookies.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, Vite, Redux Toolkit, React Router, Tailwind CSS, Framer Motion (`motion`), Axios, Firebase Auth |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose, JSON Web Tokens (JWT), Cookie-Parser, Multer |
| **AI & Parsing** | OpenRouter API (`openRouter.service.js`), `pdf-parse-new` |
| **Payments** | Razorpay Node SDK & Checkout.js |
| **Deployment** | Render (Static Site for Client + Web Service for API) |

---

## 📂 Project Structure

```text
AI-interview/
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Auth.jsx
│   │   │   ├── InterviewPage.jsx
│   │   │   ├── InterviewHistory.jsx
│   │   │   ├── InterviewReport.jsx
│   │   │   └── Pricing.jsx
│   │   ├── redux/              # State management (userSlice)
│   │   ├── utils/              # Firebase configuration
│   │   └── App.jsx
│   └── package.json
│
├── server/                     # Node.js + Express Backend
│   ├── config/                 # MongoDB connection & JWT generator
│   ├── controllers/            # Auth, User, Interview, & Payment logic
│   ├── middlewares/            # Auth verification & file upload
│   ├── models/                 # User & Interview Mongoose schemas
│   ├── routes/                 # API route definitions
│   ├── services/               # OpenRouter AI & Razorpay services
│   └── index.js
│
└── README.md
