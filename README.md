# Angular Micro Frontend Example

This repository shows you how to set up micro frontends using Webpack 5 and Module Federation plugin in Angular.

**Prerequisites**

* Node 20
* Angular CLI 16
* GitHub account

## Cross-MFE Communication & Limitations

This project includes a shared `@shared` library consumed by all microfrontends via Module Federation. We explored several approaches for cross-MFE state synchronization. Below is a summary of what was implemented, what was rejected, and the hard constraints that apply to **all** browser-based cross-tab communication.

### Approaches Explored

| Approach | Status | How it works |
|----------|--------|--------------|
| `CustomEvent` (window) | Replaced | String-based pub/sub using `window.dispatchEvent` / `window.addEventListener`. Works across separately bootstrapped Angular apps because `window` is the only true global. |
| `BroadcastChannel` | Replaced | Typed `Channel<T>` abstraction over the `BroadcastChannel` API. Cleaner than string events, designed for cross-context messaging. |
| `SharedWorker` | **Current** | A `SharedWorker` holds basket state in memory. Any tab connects and immediately receives the current array. Fallback to in-memory `BehaviorSubject` when `SharedWorker` is unavailable (e.g. Safari/iOS). |

### Fundamental Limitations

All three approaches above share the same hard constraints because they are **in-memory messaging** mechanisms:

1. **Ephemeral state** — If **all** tabs are closed, the state is lost. A new tab opened later starts from empty state because there is no persistent store.
2. **Same-origin only** — `SharedWorker` and `BroadcastChannel` only work between browsing contexts of the **same origin** (same protocol + host + port). In this project, Store runs on `:4202` and Basket on `:4203`. When opened directly on their own ports, they **cannot** share a worker or channel. They **can** share state only when both are loaded through Shell (`:4200`).
3. **No message queueing** — Messages are delivered only to listeners that are alive at the moment of sending. If Basket is not yet open when Store sends an update, that update is lost forever.

### What This Means in Practice

| Scenario | Does basket sync work? | Why |
|----------|----------------------|-----|
| Store & Basket both open in Shell tab | ✅ Yes | Same origin, same runtime, SharedWorker is shared. |
| Store tab open, then Basket tab opened on same origin | ✅ Yes | SharedWorker persists as long as at least one tab is open; new tab connects and gets current state. |
| Store on `:4202`, Basket on `:4203`, both open | ❌ No | Different origins. Each gets its own worker instance. |
| Store adds items, **closes**, then Basket opens | ❌ No | Worker died when the last tab closed. State is gone. |
| Safari / iOS | ⚠️ Partial | Falls back to in-memory `BehaviorSubject`. Works inside one app, no cross-tab sync. |

### If You Need Persistent Cross-Tab State

To survive tab closures and work across origins, you must leave the browser's memory sandbox:

| Solution | Survives tab close? | Cross-origin? | Notes |
|----------|-------------------|---------------|-------|
| `localStorage` | ✅ Yes | ❌ Same-origin only | 5–10 MB limit. Synchronous (blocks main thread). `storage` event notifies other tabs. |
| `IndexedDB` | ✅ Yes | ❌ Same-origin only | Async, large quota, structured data. Best client-side option for complex state. |
| **Backend API** | ✅ Yes | ✅ Yes | The only solution that works across devices and survives browser restarts. |

**Recommendation:** Use `localStorage` or `IndexedDB` for client-only persistence, combined with `BroadcastChannel` for instant live updates. For production, persist basket state to a backend.

## Getting Started

To run this example, run the following commands:

```bash
git clone https://github.com/oleksii-shepel/microfrontends.git
cd microfrontends
npm i
npm run run:all
```

### Recreate this starter

You can recreate this starter project structure yourself. Here are the central Angular CLI, npm, and shell commands. The commands to add Tailwind CSS and each Angular component is skipped.

```shell
npx @angular/cli@13 new angular-microfrontend-example --create-application false --minimal
cd angular-microfrontend-example
ng generate application shell --routing --style css --inline-style
ng generate component products --project shell
ng generate component products/product --project shell --flat
ng generate library shared
ng generate interface product --project shared
ng generate service products --project shared
ng generate service basket --project shared

ng generate application basket --routing --style css --inline-style
ng generate component home --project basket
ng generate module basket --project basket --routing --route basket --module app

ng add @angular-architects/module-federation --project shell --port 4200
ng add @angular-architects/module-federation --project basket --port 4201
...
```