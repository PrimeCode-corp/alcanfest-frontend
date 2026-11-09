# React + TypeScript + Vite

## Entornos

- Producción: Railway — deploy automático desde `master`
- QA: Cloudflare Workers — desde `qa`
  - URL: https://alcanfest-qa.alcanfest-frontend.workers.dev
  - Deploy manual: `npm run build && npx wrangler deploy`
  - Máximo 25 MiB por archivo en `public/`. `worker/` da soporte de rangos a los MP4 (Safari lo exige) y solo corre en QA.

## Flujo

Todo cambio, también un hotfix, sigue estos pasos:

1. Crear la rama de trabajo desde `master`, no desde `qa`: así no se lleva a
   producción lo que otros tengan pendiente en QA.
2. Abrir el PR de la rama a `qa`. Tras la aprobación, mergearlo y probar en QA.
3. Abrir el PR de la misma rama a `master`. Tras la aprobación, mergearlo.

Reglas:

- `qa` y `master` no aceptan push directo: todo PR necesita la aprobación de otra
  persona, y un commit nuevo la anula. Solo se admite "Create a merge commit",
  porque "Squash" y "Rebase" cambian los commits y el check de abajo no los
  reconocería en `qa`.
- Solo los admins del repo pueden mergear a `master`, porque eso despliega a
  producción (ruleset `master-produccion`). La aprobación sigue siendo obligatoria
  también para ellos (ruleset `master`).
- El check "Origen del PR" (`.github/workflows/flujo-ramas.yml`) bloquea el PR a
  `master` si el último commit de la rama no está en `qa`, o si el PR sale de la
  propia `qa`. Si el PR se abrió antes de mergear a `qa`, hay que volver a
  ejecutar el check. Si la rama recibe commits nuevos, deben pasar antes por `qa`.
- No mergear `qa` dentro de la rama de trabajo: llevaría a `master` cambios ajenos.
  Si el PR a `qa` tiene conflictos, resolverlos en una rama auxiliar creada desde
  la de trabajo, y abrir el PR a `qa` desde esa auxiliar. El PR a `master` sigue
  saliendo de la rama original.

Las reglas se aplican con los rulesets de `.github/rulesets/`, importados en
Settings → Rules → Rulesets. Esos JSON son solo una copia: si se cambian, hay que
volver a aplicarlos en GitHub.

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
