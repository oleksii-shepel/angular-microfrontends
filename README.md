# Angular Micro Frontend Example

This repository shows you how to set up micro frontends using Webpack 5 and Module Federation plugin in Angular.

**Prerequisites**

* Node 20
* Angular CLI 16
* GitHub account

## Cross-MFE Communication

Basket state is synchronized across microfrontends using **`localStorage`**.

### Why `localStorage`

We explored three in-memory messaging approaches before settling on `localStorage`:

| Approach | Status | Why it was rejected |
|----------|--------|---------------------|
| `CustomEvent` (window) | Abandoned | Ephemeral — messages are lost if the receiver tab is not open. |
| `BroadcastChannel` | Abandoned | Ephemeral — same problem: no message queueing, state lost when all tabs close. |
| `SharedWorker` | Abandoned | Ephemeral + same-origin only. Also unsupported in Safari/iOS. |

All three are **in-memory** mechanisms. The state lives only as long as something is holding it in RAM. If every tab is closed, the state is gone. Only persistent storage solves this.

### How it works

`BasketService` (in `@shared`) uses `localStorage` as the single source of truth:

1. **Persist** — `addToBasket()` writes the updated array to `localStorage`
2. **Notify same tab** — A `BehaviorSubject` emits the change immediately for reactive UI updates
3. **Notify other tabs** — The `storage` event fires in other tabs when `localStorage` changes, so they re-read and update their UI
4. **New tab** — On initialization, `BasketService` reads the current basket from `localStorage`, so a freshly opened Basket tab sees the items immediately

```
Store MFE          localStorage          Basket MFE
   |                    |                     |
   |-- addToBasket() -->|                     |
   |-- localStorage ---->|                     |
   |                    |-- storage event --->|
   |                    |                     |-- loadFromStorage()
   |                    |                     |-- render basket
```

### Limitations

- **Same-origin only** — `localStorage` is scoped to the origin (`protocol + host + port`). Store on `:4202` and Basket on `:4203` cannot share `localStorage`. They **can** share state only when both are loaded through Shell (`:4200`).
- **5–10 MB limit** — `localStorage` is not suitable for large or complex data.
- **Synchronous API** — `localStorage` read/write blocks the main thread.
- **No cross-device sync** — Closing the browser entirely and reopening on another device won't restore the basket. For that, a backend API is required.

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