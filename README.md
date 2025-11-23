# sokos-up-skattekort-ssr

## Kom i gang

1. Installere [Node.js](https://nodejs.dev/en/)
2. Installer [pnpm](https://pnpm.io/)
3. Installere dependencies `pnpm install`
4. Start appen med to følgende måter:

- Mot [hono.dev](https://hono.dev/) mock server -> `pnpm run mock` i en terminal, og deretter `pnpm run dev` i en annen terminal
- Mot backend -> Sett miljøvariabel `SKATTEKORT_API_URL` og kjør `pnpm run dev`

5. Appen nås på [http://localhost:4321](http://localhost:4321)

## Funksjoner

### Skattekort

Applikasjonen har et skattekort-søk som gjør det mulig å:

- Søke etter skattekort basert på fødselsnummer (11 siffer)
- Velge mellom inneværende og forrige år
- Se skattekortinformasjon inkludert prosentsats, tabellnummer og trekkgrunn

**Utvikling:**

1. Start både mock server og dev server: `pnpm run dev:mock`
2. Gå til [http://localhost:4321](http://localhost:4321)
3. Test med fødselsnummer `12345678901` og velg år 2024 eller 2025

## Design

Det finnes et utkast til en designguide kan man basere seg på: [Kjerneoppsett Utbetalingsportalen](https://navno-my.sharepoint.com/:o:/g/personal/julie_utgard_nav_no/EtV6P-sYimZNsACTYqZmSbsBLeSlsvc6PP2svso_H09dZA?e=KSY5SO)
