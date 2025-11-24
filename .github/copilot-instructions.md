# Development Guidelines for sokos-up-skattekort-ssr

## Project Overview

This is an Astro SSR microfrontend for the NAV Utbetalingsportalen (Payment Portal), using server-side rendering with React components and the NAV Aksel design system.

## Tech Stack

- **Framework**: Astro 5.x with SSR mode
- **UI Library**: React 19.x
- **Design System**: NAV Aksel (@navikt/ds-react, @navikt/ds-css)
- **Authentication**: @navikt/oasis (Azure token validation)
- **Styling**: CSS Modules with PostCSS prefix selector
- **Type Safety**: TypeScript with Zod schemas
- **Package Manager**: pnpm (>=9.15.9)
- **Node**: >=22.17.1

## Astro Best Practices

### Templates and Integrations

- Use `astro add` for official integrations (e.g., `astro add tailwind`, `astro add react`)
- Install other packages with `pnpm add` rather than editing package.json directly

### Current APIs

- Always verify using latest Astro documentation, especially for:
  - Sessions and actions
  - Content collections
  - Middleware patterns
  - SSR adapter configurations
  - Forms and server actions

### Project Structure

- Use TypeScript path aliases defined in tsconfig.json:
  - `@components/*` → `src/components/*`
  - `@layouts/*` → `src/layouts/*`
  - `@pages/*` → `src/pages/*`
  - `@types/*` → `src/types/*`
  - `@schema/*` → `src/types/schema/*`
  - `@utils/*` → `src/utils/*`

## Code Style & Conventions

### File Naming

- Astro components: PascalCase (e.g., `Layout.astro`)
- CSS Modules: `ComponentName.module.css` (PascalCase for component modules) or `_pageName.module.css` (underscore prefix for page modules)
- TypeScript files: camelCase for utilities, PascalCase for types
- Use `.ts` for utility files, `.astro` for components

### Component Patterns

- Use Astro components for layouts and pages
- Use React components from @navikt/ds-react for UI elements
- Import React components in Astro frontmatter when needed
- Prefer CSS Modules for component-specific styles

### Styling

- All CSS is prefixed with `.sokos-up-skattekort-ssr` to prevent leaking outside the microfrontend
- CSS Modules are excluded from prefixing
- Use NAV Aksel design system components for consistent styling
- Follow NAV Aksel styling guidelines

### Authentication & Security

- All non-local, non-internal requests must be authenticated
- Use `@navikt/oasis` for Azure token validation
- Token available in `context.locals.token` after middleware
- Use Bearer token in Authorization header for backend requests

### Backend API Communication

**Important**: This SSR microfrontend is embedded in the Utbetalingsportalen container app, which handles proxy routing to backend services.

- **Local development**: Use full URL to mock server (`http://localhost:3000`)
- **Deployed environment**: Use relative proxy paths (e.g., `/skattekort-api/api/v1/...`)
- The container app proxies requests through `SOKOS_SKATTEKORT_PERSON_API_PROXY: "/skattekort-api"` to the actual backend
- Do NOT use environment variables for backend URLs in deployed environments - rely on the container app's proxy configuration
- This approach is identical to client-side microfrontends, where the browser makes requests through the same proxy

### Type Safety

- Define types in `src/types/` directory
- Create Zod schemas in `src/types/schema/` for validation
- Use strict TypeScript configuration
- Prefer type-safe patterns with Zod for API responses

### API Routes

- Place API routes in `src/pages/api/`
- Internal health check endpoints in `src/pages/api/internal/`

### Logging

- Use the centralized logger from `@utils/logger.ts`
- Import pino-http for HTTP request logging
- Log errors with context for debugging

### Environment Detection

- Use utilities from `@utils/environment.ts`
- Check `isLocal` for local development
- Check `isInternal()` for internal endpoints

## NAV-Specific Patterns

### Microfrontend Configuration

- Built as a standalone microfrontend for Utbetalingsportalen
- Inline stylesheets always for microfrontend isolation
- External dependencies (react, react-dom) via importmap

### Design System

- Use components from `@navikt/ds-react` (Heading, BodyLong, Table, Textfield, Button, etc.)
- Import icons from `@navikt/aksel-icons`
- Import CSS from `@navikt/ds-css`
- Follow NAV's accessibility guidelines

### Middleware Flow

1. Check if local environment → skip auth
2. Check if internal endpoint → skip auth
3. Validate Azure token via @navikt/oasis
4. Return 401 if token missing or invalid
5. Store token in `context.locals.token` for use in pages

## Commands

- `pnpm dev` - Start development server
- `pnpm dev:mock` - Start both mock server and dev server concurrently
- `pnpm build` - Type check and build for production
- `pnpm mock` - Run mock server for local development
- `pnpm preview` - Preview production build
- `pnpm stylelint` - Lint CSS files

## Common Patterns

**Use API Routes (not Astro Actions) for forms** because:

- Direct access to `context.locals.token` from middleware
- Full control over request/response handling for backend proxying
- Consistent with existing `/api/*` structure
- Better for authenticated backend requests

## Code Quality

- Run prettier for formatting (configured with prettier-plugin-astro)
- Run stylelint for CSS linting with @navikt/aksel-stylelint
- Use lint-staged for pre-commit hooks
- Maintain strict TypeScript configuration

## Documentation References

- Astro docs available via MCP server
- NAV Aksel: https://aksel.nav.no/
- @navikt/oasis: For authentication patterns
