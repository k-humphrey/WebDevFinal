# agents.md

## Project Overview
This project is a web application for building, managing, and exporting resumes. Users can authenticate, generate content using AI, and assemble resumes from reusable components.

### Core Features
1. User authentication
2. AI-powered (Gemini API) resume content generation
3. Resume builder with export functionality (PDF, DOCX, etc.)

### Tech Stack
- Frontend: Tailwind CSS, Flowbite
- Backend: Node.js , Express 
- Database: SQLite
- Package management: npm (no CDN usage)
- AI Integration: Gemini API 

---

## Agent Roles

### 1. Auth Agent
**Goal:** Implement and maintain secure user authentication.

**Responsibilities:**
- User registration and login
- Password hashing (bcrypt)
- Session authentication

**Constraints:**
- Never store plain text passwords
- Use environment variables for secrets
- Keep auth logic modular (e.g., `/auth` directory)

---

### 2. AI Integration Agent
**Goal:** Integrate AI to generate resume content efficiently.

**Responsibilities:**
- Connect to Gemini API
- Create prompts for:
  - Work experience bullet points
  - Summaries/objectives
  - Skills suggestions
- Handle API responses and errors
- Cache or store generated outputs when appropriate

**Guidelines:**
- Keep prompts reusable and versioned
- Avoid unnecessary API calls (debounce or batch where possible)
- Store generated content in SQLite when tied to a resume

---

### 3. Resume Builder Agent
**Goal:** Enable users to create structured resumes from components.

**Responsibilities:**
- CRUD operations for:
  - Resumes
  - Resume components (education, experience, etc.)
  - Reusable templates/components
- Allow users to assemble resumes dynamically
- Maintain ordering and formatting

**Database Tables (example):**
- users
- types

### 4. Export Agent
**Goal:** Allow resumes to be exported in usable formats.

**Responsibilities:**
- Generate PDF exports (e.g., using Puppeteer or PDF libraries)
- Ensure formatting matches preview
- Handle download or email delivery

**Constraints:**
- Output must be ATS-friendly
- Keep styling consistent with Tailwind design

---

### 5. UI Agent
**Goal:** Build clean, responsive UI using Tailwind + Flowbite.

**Responsibilities:**
- Create reusable components (forms, cards, modals)
- Maintain consistent design system
- Optimize UX for resume editing
- Ensure mobile responsiveness

---

### 6. Database Agent
**Goal:** Maintain and evolve SQLite schema.

**Responsibilities:**
- Define schema and migrations
- Optimize queries
- Ensure data integrity (foreign keys, constraints)

---

## Development Guidelines

### Code Structure
- `/JS/server.js` → API endpoints
- `/HTML and /CSS` → frontend UI
- `/JS/app.js` → control logic

---

### General Rules
- Use fetch instead of async await
- Keep functions small and focused
- Reuse logic 
- Validate all user input
- Log errors clearly

---

### Environment Variables
Store sensitive values in `.env`:

## Notes for Codex / Agents
- Prioritize working features over perfection
- Make incremental, testable changes
- When adding features, update schema and API consistently
- Avoid breaking existing resume data