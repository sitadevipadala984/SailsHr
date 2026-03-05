# Copilot Instructions for SailsHr

## Repository Structure

- **apps/api**: TypeScript backend using Sails.js
  - `src/server.ts` - Server entry point
  - `src/auth.ts` - Authentication logic
  - `src/data.ts` - Data access layer
  - `db/migrations/` - SQL migrations (001_employee_core.sql, 002_attendance_core.sql)

- **apps/frontend**: Next.js frontend (TypeScript/React)
  - `app/` - App router structure
  - `app/(authenticated)/` - Protected routes
  - `components/` - Reusable UI components
  - `lib/` - Utility functions

## Code Conventions

### TypeScript
- Use strict mode (enforced in tsconfig.json)
- Type all function parameters and return values
- Use interfaces for object shapes

### Frontend (Next.js)
- Use TSX for React components
- Use Server Components by default, Client Components sparingly
- Use Tailwind CSS for styling
- Follow folder-based routing structure

### Backend (API)
- Use TypeScript strictly
- Follow RESTful conventions
- Handle errors gracefully with appropriate status codes

## Branch Naming

```
feature/<ticket-id>-short-description
bugfix/<ticket-id>-short-description
refactor/<ticket-id>-short-description
```

Example: `feature/TICKET-123-add-employee-dashboard`

## Commit Messages

Follow Conventional Commits:
```
type(scope): description

[optional body]
[optional footer]
```

Types: `feat`, `fix`, `refactor`, `chore`, `test`, `docs`

Example:
```
feat(attendance): add attendance calendar widget

Implements attendance tracking UI with date picker and status visualization.

Closes TICKET-456
```

## Pull Request Guidelines

- Title: Use the same format as conventional commits
- Description: Should include:
  - What was changed
  - Why it was changed
  - Testing notes (if applicable)
- Link the ticket/issue in the description

## Pull Request Creation Strategy

**IMPORTANT**: Use MCP tools ONLY for PR creation - do NOT use GitHub CLI (gh command).

### MCP Tools for PR Operations

The SailsHr MCP server provides the following tools via `sails-hr-mcp-server.js`:

- **create_pull_request**: Creates a pull request on GitHub via GitHub API
  - Parameters: `title`, `body`, `head` (branch name), `base` (default: "main"), `owner`, `repo`
  - Returns: PR URL and metadata
  - No GitHub CLI required - uses direct GitHub API with GITHUB_TOKEN

### Workflow for Creating PRs

1. **Use Create PR Agent**: Invoke via MCP using the Git Repository Operations Agent
2. **Delegate to MCP Server**: Agent calls `create_pull_request` tool with:
   - Title (from conventional commit format)
   - Body (narrative PR description)
   - Head branch (feature branch name)
   - Base (always "main")
3. **No Manual GitHub CLI**: Never run `gh pr create` - let MCP tools handle it

### Environment Requirements

- `GITHUB_TOKEN` environment variable must be set
- MCP server running: `node .github/sails-hr-mcp-server.js`
- No GitHub CLI installation needed

## Before Creating PR

1. Run linting and tests if applicable
2. Verify code builds without errors
3. Test the changes locally
4. Ensure no console errors in browser/terminal
5. Push branch to remote
6. Use MCP tools (not GitHub CLI) to create PR
