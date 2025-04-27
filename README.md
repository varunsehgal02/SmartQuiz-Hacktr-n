# 🧠 SmartQuiz Architect

SmartQuiz Architect is an AI-powered platform designed for teachers and students to easily create, manage, and take quizzes.  
Built with **TypeScript**, **Next.js**, **Firebase**, **TailwindCSS**, and **Ollama (open-source LLM)**.

---

## 📦 Repo Structure

- **`SmartQuiz-Hacktr-n/`** (root) → The main **SmartQuiz Architect** web app (Next.js).
- **`SmartQuizAndroidApp/quizz_app/`** → The **Mobile App** repo (Android app) that uses the **same Firebase backend** and **connects to the same LLM**.
- **`LLMBackendhacktron/`** → Contains code to **connect Ollama** (the self-hosted LLM) to the internet using **Node.js + Express** server.

---

## 🚀 Core Features

### For Teachers:
- 📚 **AI Quiz Generator**: Generate quizzes based on topic, difficulty, and Bloom's Taxonomy levels.
- 🎯 **Quiz Types**: MCQs (4 options), Fill-in-the-Blank, Short Answer, and Randomized modes.
- 📝 **Quiz Preview**: 1 question per page, fullscreen enforced with a timer.
- 🎮 **Leaderboards**: Track students' performance by college and batch.
- 👨‍🏫 **Teacher Panel**: Manage quiz links, monitor student progress, and real-time evaluation.

### For Students:
- 🧑‍🎓 **Student Panel**:
  - Join quizzes using a code.
  - View available quizzes based on their college/batch.
  - Limited permissions to generate quizzes.
- 🧩 **Export Options**: Export quizzes to PDF, Word, or Google Forms.

---

## 🛡️ Anti-Cheat System

- ✅ **Fullscreen Mode** enforced during quizzes.
- ✅ **Exit Detection**: Blurs UI + pauses timer + warning if fullscreen exited.
- ✅ **Tab Change & Mouse Tracking**: Calculates **Risk Score**.
- 🚨 **Auto-Submission**: Optional for high-risk behavior.

---

## 🏗️ Tech Stack

| Area             | Technology                     |
| ---------------- | ------------------------------- |
| **Frontend**     | TypeScript, Next.js, TailwindCSS |
| **Backend**      | Firebase Functions (serverless) |
| **Authentication** | Firebase Auth                |
| **Database**     | Firebase Firestore              |
| **AI Model**     | Ollama (self-hosted LLM)         |

---

