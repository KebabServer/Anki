# Spaced Repetition & Advanced Quiz Engine Specification Manual

This document details the schema definitions, state lifecycle tracking protocols, operational data logic parameters, and layout engine mechanisms configurations utilized within the fully static client-side codebase setup.

---

## 1. Core Data Persistence & Repetition System Architecture

The application runs an asynchronous lifecycle synchronization layer relying entirely on the browser's `localStorage` data registers. Performance monitoring flags cards across interval evaluations as follows:

- **State Level `0` (Badly):** Fails precision constraints. Immediate append operations queue the card structure block to the tail end of the current evaluation cycle array.
- **State Level `1` (OK):** Resolves core conditions but requires monitoring. Maintained in execution routines without locking state flags to locked parameters.
- **State Level `2` (Well):** Designates verified item mastery. The card is excluded from succeeding generation sessions until cache flushes trigger reset pipelines.

The internal state metrics are bound entirely against a localized key reference string matching the unique array pointer `nodeId`.

---

## 2. Dynamic JSON Quiz Specification Structures

The layout rendering matrix acts as a functional router branch tracking the structural definition rules for four native execution conditions declared directly inside the `quizType` string field:

### Type A: Standard Active Recall System (`"quizType": "anki"`)
Renders declarative computational theory questions with an interactive state transition layer separating prompt reading phases from grading evaluation choices.

{
  "nodeId": "unique_anki_pointer_09",
  "quizType": "anki",
  "question": "What is the key functional difference between asymmetric and symmetric data validation algorithms?",
  "answer": "Symmetric systems utilize a single shared secret key context parameter mapping both cryptographic operations. Asymmetric engines decouple variables across paired public/private keys configurations."
}

{
  "nodeId": "unique_mc_pointer_44",
  "quizType": "multiple_choice",
  "question": "Identify the tracking metric that assesses memory consumption leaks across browser runtimes:",
  "options": [
    "Garbage Collection allocation heap analysis graphs profiling",
    "Linear CPU execution context loop tracking cycles count",
    "Network throttling verification simulation constraints",
    "Document Object Model node structural modification count tracking"
  ],
  "correctIndex": 0
}

{
  "nodeId": "unique_dd_pointer_21",
  "quizType": "drag_drop",
  "question": "Sort the respective design patterns into their correct structural operational classification domains:",
  "choices": [
    { "text": "Singleton Class Definition", "targetCategory": "Creational Patterns" },
    { "text": "Abstract Factory Pattern", "targetCategory": "Creational Patterns" },
    { "text": "Decorator Class Wrapper", "targetCategory": "Structural Patterns" }
  ]
}

{
  "nodeId": "poker_preflop_881",
  "quizType": "poker_drag",
  "title": "Button RFI vs Aggressive Cutoff Defense",
  "phase": "PREFLOP",
  "pot": "4.00 BB",
  "communityCards": [],
  "displayText": "Action folds to the Cutoff who executes an Open Raise to 2.50 BB. Small Blind and Big Blind fold. You hold Hero perspective context arrays on the Button.",
  "players": [
    {"position": "UTG", "isActive": false, "isTurn": false, "stackSize": "100.00 BB", "currentBet": "0.00 BB"},
    {"position": "HJ", "isActive": false, "isTurn": false, "stackSize": "100.00 BB", "currentBet": "0.00 BB"},
    {"position": "CO", "isActive": true, "isTurn": false, "stackSize": "97.50 BB", "currentBet": "2.50 BB"},
    {"position": "BTN", "isActive": true, "isTurn": true, "stackSize": "100.00 BB", "currentBet": "0.00 BB", "holeCards": ["Ac", "Ts"], "isHero": true},
    {"position": "SB", "isActive": false, "isTurn": false, "stackSize": "99.50 BB", "currentBet": "0.50 BB"},
    {"position": "BB", "isActive": false, "isTurn": false, "stackSize": "99.00 BB", "currentBet": "1.00 BB"}
  ],
  "choices": [
    {"hand": "AcTs", "targetCategory": "Fold Strategy Block"},
    {"hand": "AsQs", "targetCategory": "3-Bet / Value Raise"}
  ]
}
