# QuillCraft

QuillCraft is a fully functional, feature-complete prototype educational AI workspace for designing, evaluating, and fine-tuning intelligent tutoring bots. Built with **TanStack Start (SSR React 19)** on the frontend and **FastAPI + Groq Cloud** on the backend, QuillCraft gives educators precise control over persona design, pedagogy styles, and factual reliability.

> 📖 **Comprehensive Technical Documentation**: For complete pipeline details, model comparisons, architecture diagrams, and changelogs, refer to [PROJECT_GUIDE.md](file:///d:/Projects/QuillCraft/PROJECT_GUIDE.md).

---

## Key Features

- **Dynamic Persona Synthesis**: Build educational bots with customized role/subject, personality, answering philosophy (*Hints-first* vs *Direct Answers*), and custom behavioral rules.
- **Multi-Model Parallel Comparison**: Compare outputs between foundation models side-by-side (including `qwen/qwen3.8-27b`, `openai/gpt-oss-120b`, `llama-3.3-70b-versatile`, `openai/gpt-oss-20b`, and `groq/compound-mini`) on identical student prompts.
- **Two-Stage Confidence Evaluation**: Generates a reply and subsequently conducts an independent evaluation scoring factual accuracy, role alignment, and clarity (0-100%) with explanatory rationale.
- **Interactive Fact-Checking**: Run factual checks on any response with color-coded verdict badges (*Holds up*, *Partially accurate*, *Inaccurate*) and explanations. Responses scoring under 60% confidence automatically suggest a one-click investigation.
- **In-Session Refinement Tracking**: Detects when an educator tunes their bot and a student asks an 80%+ textually similar question, notifying them when confidence improves by $\ge 15\%$.
- **LaTeX Math & Code Formatting**: Integrated KaTeX rendering for complex formulas (calculus, vectors, fractions, physics equations) and syntax-highlighted code blocks with 1-click copying.
- **Clear Create vs. Edit Flow**: Home page and navigation strictly provide a blank canvas for creating new bots; editing is targeted explicitly when clicking "Edit Bot" inside the chat panel.

---

## Project Structure

- `backend/` - FastAPI service, SQLite persistence layer (`quillcraft.db`), Groq SDK integration, and REST routes (`/api/v1/bot`).
- `frontend/` - TanStack Start application, Tailwind CSS v4, KaTeX math formatting, Framer Motion animations, and state store.
- `frontend/public/` - Static assets and demo screenshot assets.
- `PROJECT_GUIDE.md` - Complete architectural documentation, model OTPM bounding details, and changelog.

---

## Screenshots

### Home
![QuillCraft home screen](frontend/public/home.png)

### Bot Builder
![QuillCraft bot builder screen](frontend/public/bot.png)

### Chat
![QuillCraft chat screen](frontend/public/chat.png)

---

## Quick Start

### 1. Backend Setup (FastAPI)
```bash
cd backend
python -m venv .venv

# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
```

Create or configure `backend/.env`:
```ini
GROQ_API_KEY=gsk_your_groq_api_key_here
```

Start the backend:
```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation is available at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup (TanStack Start + Vite)
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:8080/` in your browser.

---

## Available Scripts

In the `frontend` folder:
- `npm run dev` - Start the local development server.
- `npm run build` - Compile and generate production bundle with Nitro.
- `npm run preview` - Preview production build locally.
- `npm run lint` - Run ESLint.
- `npm run format` - Format files with Prettier.

---

## Built By

Built by **Abdullah Siddique**.

- **GitHub**: [https://github.com/abdullah90907/QuillCraft](https://github.com/abdullah90907/QuillCraft)
- **LinkedIn**: [https://www.linkedin.com/in/mr-abdullah-siddique/](https://www.linkedin.com/in/mr-abdullah-siddique/)
- **Website**: [https://abdullahsiddique.co.uk](https://abdullahsiddique.co.uk)
