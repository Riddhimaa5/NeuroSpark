# NeuroSpark

NeuroSpark is a full-stack, multilingual web application designed as an accessible, early neurodevelopmental screening tool for children. It leverages interactive, browser-based tasks to help identify early indicators of conditions such as Autism Spectrum Disorder (ASD), Dyslexia, Dysgraphia, and Dyscalculia.

## Key Features & Screening Tasks

1. **Gaze Tracking Task:** Uses the device's front-facing camera to track a child's eye movements, comparing social attention (faces) versus object attention (patterns) to screen for signs of ASD.
2. **The "Sparky" Imitation Task:** Children interact with "Sparky", an animated character who performs gestures (like waving, pointing, or touching their head). The child is asked to mimic these movements, which helps assess motor skills and social imitation (key indicators for ASD).
3. **Conversation Task (Chat with Sparky):** An interactive module where the child chats with Sparky, designed to evaluate conversational and social interaction skills.
4. **Handwriting Task:** An interactive canvas that checks for letter reversals and formation patterns commonly associated with Dyslexia and Dysgraphia.
5. **Phonics Assessment:** Evaluates phonological processing abilities through targeted auditory and matching exercises.
6. **Comprehensive Reporting:** Automatically generates a detailed screening report with risk indicators (High, Moderate, Low), recommended classroom accommodations, and actionable next steps.
7. **Multilingual Interface:** Native support for English and over a dozen regional Indian languages (Hindi, Kannada, Tamil, Telugu, Marathi, Bengali, etc.) through an automated translation pipeline.

## Tech Stack

### Frontend
- **Framework:** React + Vite
- **Styling:** CSS / TailwindCSS
- **Features:** Browser APIs for MediaStream (Camera) and Canvas interactions

### Backend
- **Framework:** FastAPI (Python)
- **Database:** SQLite (managed via SQLAlchemy ORM)
- **Authentication:** Secure JWT-based auth

## Getting Started

### Prerequisites
- **Node.js** (v16+ recommended)
- **Python** (v3.8+ recommended)

### 1. Frontend Setup
Navigate to the `neurospark` directory, install dependencies, and start the development server:
```bash
cd neurospark
npm install
npm run dev
