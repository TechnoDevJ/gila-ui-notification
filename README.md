# Gila UI — Notification System Frontend

Angular frontend for a notification dispatch system. Send categorized messages and track their delivery status across multiple users and channels in real time.

## Stack

- **Angular 20** (standalone components, new control flow `@if` / `@for`)
- **Angular Material** — UI component library (azure/blue theme)
- **RxJS** — reactive HTTP calls and polling
- **Angular Reactive Forms** — form validation
- **SCSS** — styles with semantic color variables
- **Karma + Jasmine** — unit tests

## Pages

| Route | Description |
|---|---|
| `/send` | Send a notification message. After submit, polls delivery logs every 1 s for up to 15 s. |
| `/messages` | Full message history with a "View Logs" link per message. |
| `/logs` | All notification logs. Accepts `?messageId=X` to filter by message. |

## Getting started

```bash
npm install
npm start       # runs at http://localhost:4200
```

## Running tests

```bash
npm test        # watch mode
npm test -- --watch=false --browsers=ChromeHeadless   # single run (CI)
```

48 tests across services and components.

## Backend

Expected at `http://localhost:8080/api/v1`. To point to a different URL, edit:

```
src/environments/environment.ts
src/environments/environment.development.ts
```

```ts
export const environment = {
  production: false,
  apiUrl: 'http://your-backend-host/api/v1'
};
```

## API endpoints consumed

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/categories` | Load category dropdown |
| `POST` | `/messages` | Send a notification message |
| `GET` | `/messages` | List all sent messages |
| `GET` | `/logs` | List all notification logs |
| `GET` | `/logs/{messageId}` | Logs for a specific message |

## Design decisions

**Standalone components** — no NgModules, each component declares its own imports. Simpler dependency graph and better tree-shaking.

**New Angular control flow** — `@if`, `@for`, `@switch` instead of structural directives. Fewer imports, better performance.

**Lazy-loaded routes** — each feature is a separate chunk loaded on demand.

**RxJS polling** — `interval` + `takeUntil` for the post-send log polling. Stops automatically when all logs reach a terminal status (`SENT` / `FAILED`) or after 15 seconds.

**Angular Material** — consistent, accessible UI with minimal custom CSS. Only the modules needed per component are imported.
