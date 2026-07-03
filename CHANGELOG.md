# KnowledgeHub AI Changelog

All notable changes, fixes, and improvements are documented here.

---

### Fix: Card component missing onClick prop

- **File**: `frontend/components/ui/card.tsx`
- **Problem**: TypeScript build error: `Property 'onClick' does not exist on type` when `admin/page.tsx` passes `onClick` to `Card`.
- **Root Cause**: The `Card` component's props type only included `className` and `children`, but the admin page uses it as a clickable card with `onClick`.
- **Fix**: Added `onClick?: React.MouseEventHandler<HTMLDivElement>` to the Card component's props type and passed it through to the underlying `<div>`.

### Fix: Qdrant healthcheck using unavailable wget command

- **File**: `docker-compose.yml` (qdrant service)
- **Problem**: Docker marks qdrant as unhealthy and dependent containers fail to start. The container itself starts fine.
- **Root Cause**: The healthcheck used `wget --spider http://localhost:6333/health`, but the `qdrant/qdrant` Docker image does **not** include `wget` or `curl`. The command fails immediately with "command not found".
- **Fix**: Disabled the qdrant healthcheck entirely (`healthcheck: disable: true`). Changed backend and arq-worker `depends_on` for qdrant from `condition: service_healthy` to `condition: service_started`. The backend connects to qdrant lazily (only during document ingestion and queries), so it can tolerate a brief startup delay.

## 2026-07-03

### Fix: Missing PostCSS config for Tailwind v4

- **File**: `frontend/postcss.config.mjs` (created)
- **Problem**: The frontend build fails because `globals.css` uses `@import "tailwindcss"` but there is no PostCSS configuration to process it. Tailwind CSS v4 requires the `@tailwindcss/postcss` PostCSS plugin to be explicitly configured.
- **Root Cause**: The project was set up with Tailwind v4 (`tailwindcss: ^4.0.0`, `@tailwindcss/postcss: ^4.0.0` in `package.json`) but was missing the `postcss.config.mjs` file that tells Next.js/PostCSS to use the `@tailwindcss/postcss` plugin.
- **Fix**: Created `postcss.config.mjs` that registers `@tailwindcss/postcss` as the PostCSS plugin.

### Fix: Missing frontend/public/ directory

- **File**: `frontend/public/.gitkeep` (created)
- **Problem**: The frontend Dockerfile references `/app/public` to copy static assets (`COPY --from=builder /app/public ./public`), but the directory does not exist.
- **Root Cause**: A `public/` directory is standard for Next.js static assets but was never created.
- **Fix**: Created `frontend/public/` directory with `.gitkeep`.

### Fix: Missing Docker infrastructure directories

- **Files**: `docker/nginx/conf.d/`, `docker/nginx/ssl/`, `docker/postgres/init/` (created)
- **Problem**: Docker Compose mounts these paths as volumes. If they don't exist, Docker creates empty directories owned by root, which can cause permission issues or confusion.
- **Root Cause**: These directories were referenced in `docker-compose.yml` but were never created in the repository.
- **Fix**: Created all three directories (with `.gitkeep` in `docker/postgres/init/`). The nginx directories intentionally remain empty as placeholders.

### Fix: Frontend Dockerfile missing build-time env vars

- **File**: `frontend/Dockerfile`
- **Problem**: `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` were set only in `docker-compose.yml` as runtime environment variables. However, Next.js inlines `NEXT_PUBLIC_*` variables at **build time**, so they were being baked with their TypeScript default values regardless of what `docker-compose.yml` specified.
- **Root Cause**: Next.js replaces `process.env.NEXT_PUBLIC_*` references with the literal value during `npm run build`. Runtime `ENV` in docker-compose has no effect on these variables.
- **Fix**: Added `ARG` declarations at the top of the Dockerfile and corresponding `ENV` assignments in the builder stage. Docker Compose now passes these as `build.args`.

### Fix: Frontend volume mount shadows standalone build output

- **File**: `docker-compose.yml` (frontend service)
- **Problem**: The volume mount `- ./frontend:/app` replaces the entire `/app` directory (including the built `.next/standalone`, `.next/static`, and `node_modules`) with the host's source code. At runtime, the built application files from the Docker build are invisible.
- **Root Cause**: The frontend Dockerfile uses a multi-stage build producing a standalone Next.js output (`output: "standalone"`), but the volume mount at runtime completely shadows it, leaving the container with only raw source code and no compiled output.
- **Fix**: Removed the `volumes` and `environment` blocks from the frontend service. Environment variables are now passed as Docker build args. The container runs from the built image.

### Fix: Import order in skeleton.tsx

- **File**: `frontend/components/ui/skeleton.tsx`
- **Problem**: The `import { cn } from "@/lib/utils"` statement was at the **bottom** of the file (line 4) after the component definition. While JavaScript hoists imports, this violates standard convention and can confuse bundlers/linters.
- **Root Cause**: Inadvertent placement during initial file creation.
- **Fix**: Moved the import statement to the top of the file (line 1).

### Fix: Invalid semicolons in .gitignore

- **File**: `.gitignore`
- **Problem**: The `.gitignore` file used semicolons (`;`) to separate patterns on the same line (e.g., `__pycache__/; *.py[cod];`). Git's `.gitignore` format treats each line as a single pattern and does **not** support semicolons as separators. The entire line was interpreted as one invalid pattern, meaning nothing was actually ignored.
- **Root Cause**: The file was written with semicolons as pattern separators, mimicking shell/Python syntax, but `.gitignore` requires one pattern per line.
- **Fix**: Rewrote the file with each pattern on its own line. This ensures `__pycache__/`, `node_modules/`, `.next/`, `.env`, and other critical patterns are properly ignored.
