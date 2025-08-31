# Studyflash Hiring Challenge: Starting Point

## Intro

Welcome! Use this repo as the starting point for your submission to the **Studyflash** mobile developer hiring challenge. You’ll build a simple streaming AI chatbot that mimics the look and feel of **ChatGPT**

---

## Features (what the app provides)

This starter app demonstrates a simple streaming AI chat experience. Key features included in the project:

- Chat UI: message bubbles for user, scrollable conversation view.
- Message input: text input with send action and basic keyboard handling.
- Error handling & loading states: UI shows when the app is waiting for model responses or when errors occur.
- Minimal styling that resembles ChatGPT’s conversational look-and-feel (bubbles, feedback controls (thumbs up/down), or message actions (copy)).
- Haptic feedback
- Entering and exiting animations on elements
- Markdown support
- Temperature unit switcher (weather widget)
- Dark and light theme
- Safe area handling

---

## Getting started

* **pnpm** installed
* Gemini API key (provided as part of the challenge)

Create `.env.local` in the project root:

```bash
GOOGLE_GENERATIVE_AI_API_KEY=provided_key_here
```

---

## Running in Expo 

1. Install deps:

   ```bash
   pnpm install
   ```
2. Start the dev server:

   ```bash
   npx expo
   ```
3. Open the app:

   * **iOS Simulator:** press `i` in the terminal.
   * **Real device:** install **Expo Go**, scan the QR code.


---

## Key files to work on

* **Primary (chat UI):** `app/(tabs)/index.tsx`
  *This is the main file to implement your chat experience.*
* **API route (streaming/tools example):** `app/api/chat+api.ts`
---

## Development build (optional)

If you need more than Expo Go (e.g., native modules or a custom dev client):

* Use the prepared branch:

  ```bash
  git checkout native-development-build
  ```
* Or create your own dev client:

  ```bash
  pnpm expo run:ios  
  pnpm expo start 
  ```

