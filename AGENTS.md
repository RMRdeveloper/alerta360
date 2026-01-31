# AGENTS.md — Convenciones de código

Este archivo define las convenciones de código y la estructura del proyecto Alerta360. Tanto agentes de IA como desarrolladores deben seguir estas reglas al editar o generar código.

## 1. Stack y entorno

- **Backend**: NestJS, MongoDB (Mongoose), API REST, Swagger.
- **Frontend**: Vue 3 (Composition API), Vite, Tailwind CSS, Pinia, Vue Router, i18n (ES/EN).

Requisitos: Node 18+, MongoDB. Variables de entorno vía `.env` (no commitear; usar `.env.example` como plantilla).

## 2. Estructura del proyecto

- **Backend** (`backend/`): Módulos por dominio bajo `src/` (ej. `missing-persons/`, `children/`, `sightings/`, `auth/`). Por módulo: `*.controller.ts`, `*.service.ts`, `*.module.ts`, `dto/` (create-*.dto.ts), `schemas/` (Mongoose).
- **Frontend** (`frontend/src/`): `views/` (páginas, sufijo `*View.vue`), `components/`, `composables/` (use*.ts), `services/`, `stores/`, `router/`, `types/`, `layouts/`.
- **Funciones utilitarias**: Centralizar en `utils.ts` (o `utils.js` si el módulo o proyecto usa JavaScript). En backend: `src/utils.ts` o `src/utils/`; en frontend: `src/utils.ts` o `src/utils/`. Funciones puras, de formateo o helpers reutilizables que no encajan en un módulo de dominio ni como composable.

## 3. Convenciones Backend (NestJS)

- **Nombres de archivos/carpetas**: kebab-case (ej. `missing-persons`, `create-missing-person.dto.ts`).
- **Clases**: PascalCase (Controller, Service, DTO, Schema).
- **DTOs**: Usar `class-validator` y `class-transformer`; documentar con `@ApiProperty` / `@ApiPropertyOptional` de `@nestjs/swagger`. Los decoradores de opcionalidad (ej. `@IsOptional()`) deben ir **siempre primero** (más arriba) en cada propiedad, ya que los decoradores se ejecutan de abajo hacia arriba.
- **Controladores**: Decorar con `@ApiTags('<nombre>')` para agrupar en Swagger; documentar operaciones/respuestas cuando aporte valor. Mantener la documentación Swagger actualizada cuando se modifiquen endpoints, DTOs o respuestas.
- **Código**: ESLint (TypeScript recommended + Prettier) y Prettier con single quotes y trailing commas; ejecutar `npm run lint` y `npm run format` en `backend/` antes de commit.

## 4. Convenciones Frontend (Vue 3)

- **Componentes/vistas**: PascalCase en nombres de archivo (ej. `MissingPersonCard.vue`, `HomeView.vue`).
- **Composables**: Prefijo `use` + PascalCase en archivo (ej. `useGeolocation.ts`, `useRiskMap.ts`). Siempre considerar si algo debe ser un composable antes que dejar funciones o métodos sueltos en vistas o componentes; extraer lógica reutilizable o con responsabilidad clara a un composable, siguiendo SRP, DRY y KISS.
- **Script**: Preferir `<script setup lang="ts">` y Composition API; TypeScript en tipos y servicios.
- **Estilos**: Tailwind CSS; clases en el template; evitar estilos inline salvo casos necesarios.
- **i18n**: Soporte ES/EN; usar claves de traducción en lugar de texto fijo en la UI cuando corresponda.

## 5. Comandos útiles

- **Backend** (desde `backend/`): `npm run start:dev`, `npm run lint`, `npm run format`, `npm run test`.
- **Frontend** (desde `frontend/`): `npm run dev`, `npm run build`.
- **API docs**: Swagger en `http://localhost:3000/api/docs` con el servidor backend en marcha.

## 6. Principios de diseño

- **SRP (Single Responsibility Principle)**: Cada módulo, clase o función debe tener una única razón para cambiar. En backend: controladores solo orquestan y delegan en servicios; servicios encapsulan lógica de negocio y acceso a datos. En frontend: componentes y composables con responsabilidad clara; no mezclar llamadas API, lógica de UI y formateo en el mismo bloque.
- **DRY (Don't Repeat Yourself)**: Evitar duplicar lógica o datos. Centralizar URLs base, rutas API y constantes de dominio en un único lugar (ej. `api.ts` o `constants/`, `config/`). Si la misma constante o string aparece en más de un archivo, extraerla a un módulo compartido.
- **KISS (Keep It Simple, Stupid)**: Preferir soluciones simples y legibles; no sobreingeniería. Priorizar código explícito sobre abstracciones prematuras.
- **Guard clauses**: Programar siempre usando guard clauses (salidas tempranas). En lugar de anidar `if/else` con el flujo “feliz” dentro de muchos niveles, validar condiciones de error o inválidas al inicio y hacer `return`/`throw`/`continue` de inmediato; el cuerpo principal de la función debe quedar al nivel de indentación más bajo posible. Aplicar en backend y frontend.

## 7. Naming: siempre camelCase y descriptivo

- **Variables, funciones, propiedades y constantes** en código: siempre **camelCase** (ej. `backendUrl`, `getMissingPersons`, `defaultMapZoom`). Aplicar en backend y frontend.
- **Nombres descriptivos**: Los nombres deben indicar claramente qué representan. No usar abreviaturas crípticas ni nombres de una o dos letras (evitar ejemplos como `m`, `ac`, `p`, `mn`, `i` salvo en bucles muy cortos donde sea idiomático, p. ej. índice). Preferir `missingPerson`, `activeCase`, `person`, `missingPersonName`, etc.
- Excepciones ya establecidas: nombres de **archivos/carpetas** en backend en kebab-case; nombres de **clases** en PascalCase; nombres de **archivos de componentes/vistas** en frontend en PascalCase (ej. `MissingPersonCard.vue`).

## 8. Evitar magic strings

- No usar strings literales repetidos o con significado de configuración/dominio repartidos por el código. Usar **constantes nombradas** (camelCase) o config centralizada.
- **Backend**: Nombres de cookies (ej. token), rutas de API internas, claves de JWT, estados de dominio (ej. `missing`, `found`), refs de Mongoose (ej. `'MissingPerson'`) y valores por defecto (ej. `'1d'` para JWT) deben definirse en `config/` o constantes del módulo y reutilizarse.
- **Frontend**: URL base del API, rutas de API (ej. `/auth/login`, `/missing-persons`), rutas de navegación y claves de env (ej. `VITE_API_URL`) centralizar en `services/api.ts`, `constants/` o un módulo de config; no repetir `BACKEND_URL` o paths en cada vista o store.
- Ejemplos a corregir o evitar en nuevo código: cookie `'360alert_authentication'` y rutas `/auth/*` en varios archivos; `BACKEND_URL` duplicado en LoginView y RegisterView (usar `api.defaults.baseURL` o constante compartida); paths como `/missing-persons`, `/sightings` en múltiples vistas (extraer a constantes de rutas API).

## 9. Comentarios y documentación

- **Comentarios**: Dejar solo los comentarios realmente necesarios por motivo de complejidad. Los comentarios son la excepción, no la regla; el código debe ser legible por sí mismo. Evitar comentarios obvios o redundantes.
- **JSDoc**: Mantener el JSDoc actualizado siempre que se agregue o modifique un método. Documentar propósito, parámetros y valor de retorno cuando aporte claridad; actualizar la documentación en el mismo cambio que modifica la firma o el comportamiento.

## 10. Reglas generales

- No hardcodear secrets; usar variables de entorno.
- Mantener DTOs y validación en backend para toda entrada pública.
- Respetar la estructura de módulos/carpetas existente al añadir features.
