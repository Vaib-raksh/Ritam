# Ritam Frontend v2

This frontend implements the Ritam product direction:

- Cosmic medication universe
- Animated orbital medication core
- Patient mode
- Caregiver mode
- "I Heard..." document-check mode
- Visual Medication Journey
- Drug selector for Metformin, Amoxicillin and Cetirizine
- Evidence/source display
- Existing FastAPI `/chat` integration
- Responsive layout
- No extra icon dependency

## Install

From the `frontend` folder:

```powershell
npm install
npm run dev
```

The frontend expects:

```text
http://127.0.0.1:8000/chat
```

FastAPI should be started from the Ritam project root:

```powershell
uvicorn backend.main:app --reload
```

## Files

Copy/replace:

```text
frontend/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   └── ritam-logo.png
└── src/
    ├── App.jsx
    ├── App.css
    ├── index.css
    └── main.jsx
```

The mode interactions are frontend-complete. The actual answer content continues to come from the Ritam RAG backend, so the UI does not invent medical information.
