# Personal AI – Voice AI Tutor

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge)](https://personal-aitutor.netlify.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](#license)
![React](https://img.shields.io/badge/Frontend-React%20(Vite)-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)

**Personal AI** is a voice-enabled AI tutor that helps learners understand any topic through structured explanations, concise summaries, and auto-generated practice questions. It supports English, Hindi, and Marathi, and can accept spoken questions and respond with audio.

**Live Application:** [https://personal-aitutor.netlify.app/](https://personal-aitutor.netlify.app/)

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

---

## Overview

Personal AI is designed to make learning fast, interactive, and accessible. A learner can type or speak a question, and the system returns a clear explanation, a short summary for quick revision, and a set of practice questions to test understanding, with optional audio playback.

## Key Features

| Feature | Description |
| --- | --- |
| **Voice Input** | Ask questions using speech instead of typing |
| **Multilingual Support** | Works in English, Hindi, and Marathi with automatic language detection |
| **AI Explanation Engine** | Clear, structured explanations of any topic |
| **Auto Summary** | Condensed key points for quick revision |
| **Quiz Generation** | Practice questions generated from the topic |
| **Audio Output** | Listen to explanations through text-to-speech |
| **Responsive UI** | Clean interface that works across desktop and mobile screens |

## Tech Stack

**Frontend**
- React (Vite)
- JavaScript (ES6+)
- Custom CSS

**Backend**
- Python, FastAPI
- LLM integration (Ollama / OpenAI-compatible)
- Speech and audio processing

**Hosting**
- Frontend deployed on Netlify

## Architecture

```
┌────────────┐   text / voice   ┌──────────────┐    prompt    ┌────────────┐
│  React UI  │ ───────────────► │ FastAPI API  │ ───────────► │ AI Engine  │
│   (Vite)   │ ◄─────────────── │   (Python)   │ ◄─────────── │   (LLM)    │
└────────────┘  explanation,    └──────────────┘   response   └────────────┘
                summary, quiz,
                audio
```

**Request flow**

1. The user enters or speaks a question.
2. The language is detected automatically.
3. The backend sends the request to the AI engine.
4. The engine generates an explanation, summary, quiz, and optional audio.
5. The response is rendered in the UI.

## Project Structure

```
project-ai/
├── frontend/            # React (Vite) client application
├── backend/             # FastAPI service
├── core.py              # Core application logic
├── engine.py            # AI engine / LLM integration
├── requirements.txt     # Python dependencies
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- An LLM provider: a local [Ollama](https://ollama.com/) instance or an OpenAI API key

### 1. Clone the repository

```bash
git clone https://github.com/pushkarthombare/project-ai.git
cd project-ai
```

### 2. Run the backend

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cd backend
uvicorn app:app --reload
```

The API will be available at `http://localhost:8000`.

### 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## Configuration

Create a `.env` file in the backend directory for any provider credentials. Example:

```env
OPENAI_API_KEY=your_api_key_here
```

Never commit `.env` files or API keys to version control.

## Deployment

The frontend is deployed on Netlify:

```bash
cd frontend
npm run build
```

Netlify settings:

- **Base directory:** `frontend`
- **Build command:** `npm run build`
- **Publish directory:** `frontend/dist`

The frontend must point to a reachable backend URL in production (for example via an environment variable such as `VITE_API_URL`).

## Roadmap

- [ ] Streaming responses
- [ ] User progress tracking
- [ ] Personalized learning paths
- [ ] Additional language support
- [ ] Mobile application

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push the branch: `git push origin feature/your-feature`
5. Open a pull request

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Author

**Pushkar Thombare**
GitHub: [@pushkarthombare](https://github.com/pushkarthombare)

---

If you find this project useful, consider giving it a star.
