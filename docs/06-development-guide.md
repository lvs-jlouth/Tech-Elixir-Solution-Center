# Tech Elixir Solution Center – Development Guide

This guide covers everything needed for local development, testing, and contributing to the project.

---

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | 16.x or 18.x | Use `nvm` to manage versions (`nvm use 18`) |
| npm | 8+ | Bundled with Node.js |
| Gulp CLI | Latest | `npm install -g gulp-cli` |
| Git | Any | Standard installation |

---

## Repository Structure

```
Tech-Elixir-Solution-Center/
├── config/
│   ├── config.json                    Bundle entry configuration
│   ├── package-solution.json          Solution manifest and feature definition
│   ├── serve.json                     Local workbench configuration
│   └── write-manifests.json
├── docs/                              Project documentation (this folder)
├── scripts/
│   └── Provision-TechElixirLists.ps1  PowerShell list provisioning script
├── sharepoint/
│   └── assets/
│       └── elements.xml               Legacy TechElixirApps list provisioning XML
├── src/
│   └── webparts/techElixirSolutionCenter/
│       ├── TechElixirSolutionCenterWebPart.ts       Web part entry point
│       ├── TechElixirSolutionCenterWebPart.manifest.json
│       ├── components/                React components (see Architecture doc)
│       ├── constants/                 Shared constants
│       ├── data/
│       │   └── mockApps.ts            Built-in seed data (sample IApplication records)
│       ├── loc/
│       │   ├── en-us.js               English resource strings
│       │   └── mystrings.d.ts         TypeScript type definitions for strings
│       ├── models/
│       │   ├── IApplication.ts        TypeScript interfaces for all data models
│       │   └── index.ts
│       ├── services/
│       │   └── AppDataService.ts      Data service (PnPjs + mock data)
│       ├── tests/
│       │   └── TechElixirSolutionCenter.test.ts
│       └── utils/
│           └── telemetry.ts           Error telemetry helper
├── package.json
├── tsconfig.json
├── tsconfig.test.json
├── gulpfile.js
└── jest.config.js
```

---

## Local Development Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Trust the development certificate (first time only)

SPFx uses a self-signed HTTPS certificate for the local dev server. Add it to your system trust store:

```bash
npx gulp trust-dev-cert
```

### 3. Configure the workbench URL

Edit `config/serve.json` and replace the `initialPage` with your SharePoint tenant URL:

```json
{
  "initialPage": "https://YOUR-TENANT.sharepoint.com/sites/YOUR-SITE/_layouts/workbench.aspx"
}
```

### 4. Start the local development server

```bash
npx gulp serve
```

This opens the SharePoint Workbench in your browser. The web part is loaded with built-in **mock data** by default — no SharePoint lists are needed during development.

The dev server supports **hot reload**: changes to TypeScript/SCSS files are reflected in the browser without a full page refresh.

---

## Running Tests

```bash
npm test
```

### What is tested

Tests are located in `src/webparts/techElixirSolutionCenter/tests/`.

| Test area | Coverage |
|---|---|
| Mock data integrity | All sample apps have valid structure matching `IApplication` |
| `AppDataService` (mock mode) | `getApplications`, `getApplicationById`, `searchApplications` |

### Running tests in watch mode

```bash
npm test -- --watch
```

### Test configuration

The Jest configuration (`jest.config.js`) uses `ts-jest` for TypeScript transpilation. The `tsconfig.test.json` extends the base config with test-specific settings. Module mocks for SPFx and PnP imports are located in `src/__mocks__/`.

---

## Building

### Development build

```bash
npx gulp bundle
```

### Production build (ship-mode)

```bash
npx gulp bundle --ship
npx gulp package-solution --ship
```

The `.sppkg` package is written to `sharepoint/solution/tech-elixir-solution-center.sppkg`.

---

## Adding a New Application to Mock Data

1. Open `src/webparts/techElixirSolutionCenter/data/mockApps.ts`.
2. Add a new `IApplication` object to the `mockApps` array.
3. Follow the existing entries for structure — all required fields must be populated.
4. Run `npm test` to verify mock data integrity tests still pass.

---

## Adding a New Component

1. Create a new folder under `src/webparts/techElixirSolutionCenter/components/MyComponent/`.
2. Add:
   - `MyComponent.tsx` — the React component
   - `IMyComponentProps.ts` — the props interface
   - `MyComponent.module.scss` — scoped styles (if needed)
3. Export from the parent component or `TechElixirSolutionCenter.tsx` as appropriate.
4. Follow Fluent UI v8 patterns for accessible, theme-aware components.
5. Add a test file in `tests/` if the component has non-trivial logic.

---

## Code Style

- **TypeScript strict mode** is enabled (`strict: true` in `tsconfig.json`).
- Use **Fluent UI v8** components (`@fluentui/react`) rather than raw HTML elements wherever a Fluent equivalent exists.
- Keep components **pure/functional** where possible.
- Avoid direct DOM manipulation — React state and refs only.
- ESLint is configured via `.eslintrc.js`. Run the linter with:

```bash
npx eslint src --ext .ts,.tsx
```

---

## Localization

String resources are in `src/webparts/techElixirSolutionCenter/loc/en-us.js`.  
Type definitions are in `loc/mystrings.d.ts`.  
Import strings in components with:

```typescript
import * as strings from 'TechElixirSolutionCenterWebPartStrings';
```

To add a new string:
1. Add the key and value to `en-us.js`.
2. Add the corresponding type to `mystrings.d.ts`.
3. Use `strings.YourKey` in the component.

---

## Environment Variables and Context

The SPFx `WebPartContext` object is passed down as a prop from the web part class to the root component and then to `AppDataService`. Do not use global singletons for context. If a deeply nested component needs context, thread it through props or use a React Context.

---

## Pull Request Checklist

Before opening a pull request:

- [ ] `npm test` passes with no failures
- [ ] `npx gulp bundle` completes without errors
- [ ] New components follow Fluent UI patterns
- [ ] New interactive elements are keyboard-navigable
- [ ] String resources added to `en-us.js` and `mystrings.d.ts`
- [ ] No secrets or tenant-specific URLs committed
- [ ] Documentation updated if behaviour changes
