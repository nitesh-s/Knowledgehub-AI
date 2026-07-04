# Agent Instructions for KnowledgeHub AI

## Mandatory Pre-Flight Checks Before Every Code Change

Before writing or editing code, read and follow these rules in order:

### 1. Read the Target File & Adjacent Context
- Read at least the full file you're editing plus any imports/utilities it references.
- Understand the data flow: where inputs come from, how they're transformed, where outputs go.

### 2. Trace the Complete Request/Response Lifecycle
For any API or UI change, mentally trace the entire flow:
- **Frontend**: Event → Handler → API call → Storage (localStorage/state) → Navigation
- **Backend**: Route → Schema validation → Service → DB query → Response
- **State timing**: When is a value stored? When is it read? Is it available at the moment of use?

### 3. Verify Storage Before Access Pattern
Any time a token, session, or cached value is returned from an API:
1. **Store it first** (localStorage, Zustand, etc.)
2. **Then access it** in subsequent operations
3. Never leave a gap between value receipt and value persistence

### 4. Check Dependency Compatibility
- When adding/changing a Python package, never assume extras (`passlib[bcrypt]`) pin sub-dependencies.
- Verify the actual version installed in a fresh build for every transitive dependency.
- Pin breaking transitive deps explicitly (e.g., `bcrypt>=4.0.0,<4.1.0` alongside `passlib[bcrypt]`).

### 5. Frontend Auth Pattern (Standard Flow)
```
Login/Register → Store token in localStorage → Read token for authenticated calls
```
The `api.ts` client reads tokens from `localStorage.getItem("token")`. Never call an authenticated route before the token is persisted.

### 6. Docker Build Awareness
- Frontend has **no volume mount** — code changes require `docker compose build frontend && docker compose up -d frontend`
- Backend uses volume mount `- ./backend:/app` with `--reload` — code changes auto-refresh, but dependency changes (`requirements.txt`) need rebuild
- `NEXT_PUBLIC_*` vars are inlined at **build time** via Docker ARG, not runtime via ENV

### 7. Error Handling Pattern
- Frontend catch blocks MUST log/render `err.message` not a hardcoded string
- Backend route handlers MUST catch expected exceptions and return structured errors
- Always surface the actual error detail in development

### 8. AuthGuard / Public Routes
- Any new unauthenticated page (login, register, password reset) must be added to the AuthGuard whitelist
- Check `frontend/components/auth-guard.tsx`

### 9. First-User Pattern
- First registered user is auto-promoted to admin in `backend/app/services/auth.py:14-16`
- Verify this logic when modifying the registration flow

### 10. Database & Alembic
- `PYTHONPATH: /app` must be set in docker-compose for alembic to find the `app` module
- `alembic.ini` requires `qualname` in every `[logger_*]` section
- Run `alembic upgrade head` after any schema change

### 11. Git & Deployment
- SSH key at `/home/nitesh/.ssh/id_ed25519` on Ubuntu, use `sudo GIT_SSH_COMMAND="ssh -i /home/nitesh/.ssh/id_ed25519" git pull`
- PAT URL pushes from this workspace, revert to SSH after push
- Server IP: `192.168.3.118`

### 12. Before Declaring Done
1. [ ] Trace the full request lifecycle end-to-end
2. [ ] Check state timing (storage before access)
3. [ ] Verify token/Auth header propagation
4. [ ] Check frontend rebuild requirement
5. [ ] Check backend dependency rebuild requirement
6. [ ] Run `docker compose build` for affected services
