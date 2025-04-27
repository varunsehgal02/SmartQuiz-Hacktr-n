# 🧠 SmartQuiz Architect

SmartQuiz Architect is an AI-powered platform designed for teachers and students to easily create, manage, and take quizzes. With a powerful AI backend, customizable quiz generation, and anti-cheat systems, it revolutionizes how quizzes are handled in educational settings.  
Built with **TypeScript**, **Next.js**, **Firebase**, **TailwindCSS**, and **Ollama (open-source LLM)**.

---

## 🚀 Core Features

### For Teachers:
- 📚 **AI Quiz Generator**: Generate quizzes based on topic, difficulty, and Bloom's Taxonomy levels.
- 🎯 **Quiz Types**: Includes MCQs (4 options), Fill-in-the-Blank, Short Answer, and Randomized modes.
- 📝 **Quiz Preview**: View a quiz with 1 question per page and a timer at the top, with fullscreen enforced.
- 🎮 **Leaderboards**: Track students' performance based on college and batch.
- 👨‍🏫 **Teacher Panel**: Teachers can generate unique quiz links, monitor student progress, and evaluate performance in real time.

### For Students:
- 🧑‍🎓 **Student Panel**:
  - Join quizzes by entering a code provided by the teacher.
  - View and participate in available quizzes based on their college/batch.
  - Generate their own quizzes on selected topics (limited permissions compared to teachers).
- 🧩 **Export Options**: Teachers can export quizzes to PDF, Word, or Google Forms.

---

## 🛡️ Anti-Cheat System

To maintain quiz integrity, our anti-cheat system includes the following features:

- ✅ **Fullscreen Mode**: The quiz auto-switches to fullscreen mode when it starts.
- ✅ **Exit Detection**: If the student exits fullscreen:
  - The quiz UI blurs.
  - Timer pauses.
  - A warning message is shown to the student.
- ✅ **Tab Change & Mouse Tracking**: The system tracks suspicious activities:
  - If a student switches browser tabs, it gets recorded.
  - A **Risk Score** is calculated based on behavior.
  - Teachers can review the risk score for each student after the quiz submission.
- (Optional) **Auto-Submission**: If a student exits fullscreen multiple times or receives a high-risk score, the quiz can be automatically submitted.

---

## 🏗️ Tech Stack

| Area           | Technology                     |
| -------------- | ------------------------------- |
| **Frontend**    | TypeScript, Next.js, TailwindCSS |
| **Backend**     | Firebase Functions (serverless) |
| **Authentication** | Firebase Auth                |
| **Database**     | Firebase Firestore              |
| **AI Model**     | Ollama (self-hosted LLM)        |

---

## 📥 Installation

To run SmartQuiz Architect locally, follow the steps below:

### 1. Clone the repository:
```bash
git clone https://github.com/your-username/smartquiz-architect.git
cd smartquiz-architect
2. Install dependencies:

npm install
3. Setup Firebase:
Go to Firebase Console, create a new Firebase project, and configure it.

Create a .env.local file in the root of the project with the following Firebase keys:

FIREBASE_API_KEY

FIREBASE_AUTH_DOMAIN

FIREBASE_PROJECT_ID

FIREBASE_STORAGE_BUCKET

FIREBASE_MESSAGING_SENDER_ID

FIREBASE_APP_ID

FIREBASE_MEASUREMENT_ID

4. Start development server:
npm run dev
Now, the application should be running at http://localhost:3000 in your browser.
