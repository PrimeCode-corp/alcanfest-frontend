# React + TypeScript + Vite

## Entornos

- Producción: Railway — deploy automático desde `master`
- QA: Cloudflare Workers — desde `qa`
  - URL: https://alcanfest-qa.alcanfest-frontend.workers.dev
  - Deploy manual: `npm run build && npx wrangler deploy`
  - Máximo 25 MiB por archivo en `public/`. `worker/` da soporte de rangos a los MP4 (Safari lo exige) y solo corre en QA.

## Flujo

feature/\* → qa (QA) → master (prod). `master` solo recibe merges desde `qa`
en fast-forward. Hotfix: sale de `master`, entra a `master`, back-merge a `qa`
el mismo día.

## Plantilla

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
