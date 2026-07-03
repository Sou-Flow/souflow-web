<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
## Custom Project Rules (Flower Shop)

- **Package Manager:** Strictly use `npm` (never use `bun` or `yarn`).
- **Linter & Formatter:** Use `@biomejs/biome`. Do not generate ESLint or Prettier configurations.
- **State Management:** Use `zustand`. Do not use Redux or Context API for global state.
- **Forms & Validation:** Use `react-hook-form` combined with `zod`.
- **Icons:** Use `lucide-react`.

- **Backend Integration:**
  - The backend API is built with Java Spring Boot.
  - Always use `axios` (via `src/services/axiosClient.ts` if available) for HTTP requests instead of the default `fetch` API.
  - Assume API responses follow typical Spring Boot RESTful standard structures.