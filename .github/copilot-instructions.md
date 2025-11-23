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

### Form Handling

**Use API Routes (not Astro Actions) for forms** because:

- Direct access to `context.locals.token` from middleware
- Full control over request/response handling for backend proxying
- Consistent with existing `/api/*` structure
- Better for authenticated backend requests

### API Route Pattern

```typescript
// src/pages/api/resource/action.ts
import type { APIRoute } from "astro";
import { RequestSchema } from "@schema/RequestSchema";
import { fetchResource } from "@utils/resourceApi";
import { ApiError, HttpStatusCodeError } from "../../../types/errors";
import logger from "@utils/logger";

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const token = locals.token;
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();
    const validated = RequestSchema.parse(body);
    const data = await fetchResource(validated, token);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error({ error }, "Error in API route");

    if (error instanceof HttpStatusCodeError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: error.statusCode,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
```

### Backend API Utility Pattern

```typescript
// src/utils/api.ts
import type { Response } from "../types/Response";
import type { Request } from "../types/Request";
import { ApiError, HttpStatusCodeError } from "../types/errors";
import logger from "@utils/logger";
import { isLocal } from "@utils/environment";

// Local development uses mock server, deployed uses proxy path from container app
const BASE_API_URL = isLocal ? "http://localhost:3000" : "/skattekort-api";
("https://utbetalingsportalen.intern.dev.nav.no/sokos-up-skattekort");

export async function fetchSkattekort(
  query: Request,
  token: string,
): Promise<Response> {
  const url = `${BACKEND_BASE_URL}/api/v1/hent-skattekort`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Pragma: "no-cache",
        "Cache-Control": "no-cache",
      },
      body: JSON.stringify(query),
    });

    if (response.status === 400) {
      throw new HttpStatusCodeError(400, "Ugyldig forespørsel");
    }

    if (response.status === 401 || response.status === 403) {
      throw new HttpStatusCodeError(response.status, "Ikke tilgang");
    }

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(
        {
          status: response.status,
          statusText: response.statusText,
          errorText,
          url,
        },
        "Backend response not OK",
      );
      throw new ApiError(
        `Issues with connection to backend: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    logger.error(
      {
        error,
        message: error instanceof Error ? error.message : "Unknown error",
        url,
      },
      "Failed to fetch skattekort",
    );
    throw error;
  }
}
```

### React Form Component Pattern

```typescript
// src/components/skattekort/Form.tsx
import { Alert, Button, Heading, Loader, TextField, ToggleGroup } from "@navikt/ds-react";
import { useState } from "react";
import type { Response } from "../../types/Response";
import styles from "./Form.module.css";

export default function Form({ currentYear = new Date().getFullYear() }) {
  const [fnr, setFnr] = useState("");
  const [inntektsaar, setInntektsaar] = useState(currentYear.toString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Response | null>(null);
  const [fnrError, setFnrError] = useState<string | null>(null);

  const validateFnr = (value: string): string | null => {
    if (!value) return "Fødselsnummer er påkrevd";
    if (value.length !== 11) return "Fødselsnummer må være 11 siffer";
    if (!/^\d{11}$/.test(value)) return "Fødselsnummer må inneholde kun tall";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setData(null);

    const validationError = validateFnr(fnr);
    if (validationError) {
      setFnrError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/skattekort/hent-skattekort", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fnr, inntektsaar: parseInt(inntektsaar) }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Noe gikk galt ved henting av skattekort");
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noe gikk galt");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Heading level="2" size="medium" spacing>Søk etter skattekort</Heading>

      <TextField
        label="Fødselsnummer (11 siffer)"
        value={fnr}
        onChange={(e) => setFnr(e.target.value)}
        error={fnrError}
        maxLength={11}
      />

      <ToggleGroup
        label="Velg inntektsår"
        value={inntektsaar}
        onChange={(value) => setInntektsaar(value)}
      >
        <ToggleGroup.Item value={(currentYear - 1).toString()}>
          {currentYear - 1}
        </ToggleGroup.Item>
        <ToggleGroup.Item value={currentYear.toString()}>
          {currentYear}
        </ToggleGroup.Item>
      </ToggleGroup>

      <Button type="submit" disabled={loading}>
        {loading ? <Loader size="small" /> : "Søk"}
      </Button>

      {error && <Alert variant="error">{error}</Alert>}
    </form>
  );
}
```

### Astro Page with React Components

```astro
---
import Layout from "@components/layout/Layout.astro";
import ResourceForm from "@components/resource/ResourceForm";
import { Heading, BodyLong } from "@navikt/ds-react";
import styles from "./_pageName.module.css";

// Server-side code here
const token = Astro.locals.token;
---

<Layout>
  <div class={styles.page}>
    <Heading level="1" size="large">Title</Heading>
    <BodyLong spacing>Description</BodyLong>
    <ResourceForm client:load />
  </div>
</Layout>
```

### Mock Server Pattern

```typescript
// mock/server.ts
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import mockData2024 from "./data/skattekort-2024.json";
import mockData2025 from "./data/skattekort-2025.json";

const api = new Hono();

api.use(
  "/*",
  cors({
    origin: "http://localhost:4321",
    credentials: true,
  }),
);

api.post("/api/v1/hent-skattekort", async (c) => {
  const body = await c.req.json();
  const { fnr, inntektsaar } = body;

  console.log("Received request:", { fnr, inntektsaar });

  if (!fnr || fnr.length !== 11) {
    return c.json({ error: "Ugyldig fødselsnummer" }, 400);
  }

  const year = Number(inntektsaar);
  if (year === 2025) return c.json(mockData2025);
  if (year === 2024) return c.json(mockData2024);

  return c.json({ error: "Fant ikke skattekort for oppgitt år" }, 404);
});

serve(
  {
    fetch: api.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Mock server running on http://localhost:${info.port}`);
  },
);
```

## Code Quality

- Run prettier for formatting (configured with prettier-plugin-astro)
- Run stylelint for CSS linting with @navikt/aksel-stylelint
- Use lint-staged for pre-commit hooks
- Maintain strict TypeScript configuration

## Documentation References

- Astro docs available via MCP server
- NAV Aksel: https://aksel.nav.no/
- @navikt/oasis: For authentication patterns
