# WORKN’T AI V3 + THINKN’T

**The world’s most useless chatbot.** Ask anything. Regret everything.

A local React + TypeScript + Vite app for FUNATHON 2026. Short student-friendly chat, plus an intentionally terrible mind-reading game. No API key, account, database, or external service is needed. Once dependencies are installed, both engines operate offline.

## Run

Requires Node.js 20.19+ or 22.12+ and npm.

```sh
npm install
npm run dev
```

Open the URL printed by Vite, normally http://127.0.0.1:5173/.

```sh
npm test          # Chat, persistence, and game domain tests
npm run build    # Type checking and production bundle
npm run preview  # Serve the production build
```

## Chat

Normal chat has a brief typing indicator and short replies. Try “What is Python?”, “Help me study”, “I’m hungry”, or “Do you love me?”. The local engine recognises common topics, avoids recent joke IDs, and occasionally refers back to an earlier exchange. Sensitive phrases use a plain safety response; stress and failure receive gentler replies. This is a limited scripted demo, not a crisis or medical service.

Enter sends; Shift+Enter adds a line. Copy, conversation search, new conversations, and deletion remain available. Old chat contents and settings are preserved, including old action handlers. Normal chat hides workflow cards, internal strategy metadata, status reports, chaos banners, and achievement interruptions. Council, Performance Center, and Meeting Simulator remain accessible under **More → WORKN’T Labs**, retaining their data and functionality. Chaos settings apply to Labs.

Use the home-screen THINKN’T card, sidebar item, or ask “Can you read my mind?” and select **Open THINKN’T**.

## THINKN’T

Think of a real person or fictional character. Answer ten adaptive questions with Yes, No, Probably, Probably Not, or Don’t Know. Answers steer the next questions and broad category; there is no actual person database or mind reading.

- Real-person paths cover sport, acting, singing, social media, politics, and personal acquaintances.
- Fictional paths cover superheroes, anime, cartoons, movies, and games.
- Uncertain answers take broader paths and receive honest, absurd non-guesses.
- **Previous question** removes the latest answer and recomputes the branch. Stale double-clicks cannot answer a new question.
- The reveal takes about two seconds and can be skipped. Reduced animation skips it automatically.
- **Correct 😂** celebrates a questionable victory. **Wrong! Try Again** changes the result, summons the manager on the second rejection, and concedes after the third. **Play Again** and **Restart round** reset the round while retaining game statistics and sound preference.
- The original SVG mascot has thinking, confident, panicked, and happy expressions. Original Web Audio tones are optional and muted by default. Audio permission failures never block gameplay.
- Round progress survives navigation and reload. Refreshing during the reveal restores the result without restarting a timer. Bad saved game data falls back safely.

## Local data

Chat uses localStorage key `worknt.workspace.v1`; THINKN’T uses `worknt.thinknt.v1`. Game answers store only question IDs and chosen answers; the character’s name is never requested. Storage failures leave a usable session and show a notice.

**Settings → Reset demo** clears chat data, achievements, settings, and game state. **Reset statistics** affects the legacy chat/Labs counters; **Clear history** affects conversations. All reset actions require an in-app confirmation. No migration deletes existing conversations.

## Verification

The automated suite covers V3 acceptance prompts repeated for variety, short output, safety fallback, saved chat recovery, council compatibility, achievement rules, every game category, 300 mixed-answer rounds, non-repeating questions, uncertainty, undo, stale answers, retries, restart, and saved game validation.

Browser QA covers chat brevity, game entry, real-athlete and fictional-superhero paths, keyboard answers, previous question, skippable and automatic reveals, all three wrong guesses, correct feedback, replay, sound controls, reload persistence, navigation, and mobile layout.

## Source

- `src/shortComedy.ts`: V3 short-form chat personality and recent-joke controls.
- `src/engine.ts`: intent detection, safety route, legacy council and metrics rules.
- `src/comedy.ts`: validated action registry, including compatibility for older messages.
- `src/thinkntEngine.ts`: pure game state machine, adaptive question selection, and category-aware endings.
- `src/Thinknt.tsx` and `src/thinknt.css`: game screen, original mascot, effects, sound, and responsive styling.
- `src/storage.ts`: validation and recovery of saved chat data.

Live LLM integration is not implemented. Demo humor is rule-based and finite; unfamiliar questions receive an honest humorous fallback. THINKN’T infers broad categories only and deliberately never identifies a specific person.

## Local memes and Malayalam

The chat header has an English / മലയാളം selector; it is saved with your preferences. Malayalam replies use local contextual jokes, so the shared API key is not used or stored. Images and GIFs are bundled from `meme for chatbot`; each new ordinary chat response picks a random meme, avoiding an immediate repeat. Saved messages keep the same meme across reloads. Serious safety messages omit memes. Add images to that folder and restart Vite to refresh the media list.

THINKN’T now ends with the clip from `meme for akinator`, without displaying a person name or a text guess. The player requests playback with audio and offers Play with sound if autoplay is blocked. Native video controls handle volume and replay. Game Effects on/off controls only the small synthesized effects. The reveal video stops when you navigate away. The older correct/wrong guessing logic is retained in the domain module for compatibility but no longer displayed.

## askinatot branding and video order

The visible app and package name are now **askinatot**. Existing local storage keys remain unchanged to preserve chats and preferences. Chat memes are loaded automatically from `meme for chatbot`, including GIFs.

The first revealed round after each page refresh plays `WhatsApp Video 2026-10-29 at 11.49.45 AM.mp4`; the second plays the new clip. Later rounds cycle through the clips. This ordering is held only in page memory, so saved round counts do not affect the first video after refresh. Returning to the same result keeps its video and does not consume another slot.
