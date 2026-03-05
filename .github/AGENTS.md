# SailsHr Agents Registry

This file defines all custom agents available in the SailsHr repository.

## Agents

### 1. Git Repository Operations Agent

**File**: [.github/git-operations-agent.md](.github/git-operations-agent.md)

**Description**: 
Manages all git repository operations including branches, commits, pull requests, tags, code search, and fork management.

**Purpose**: 
Provides comprehensive, reusable git operations for automated workflows. Handles all git-related tasks in a unified, consistent manner.

**Capabilities**:
- Branch management (create, switch, merge, delete)
- Commit management (stage, commit, amend, rebase)
- Pull request operations (create, update, manage)
- Tag operations (create, list, manage)
- Code search (commit history, code search)
- Fork management (sync, PR to upstream)
- Sync operations (with remote and main)

**Invocation**:
Only by the `create-pr-agent` via `runSubagent()`:
```javascript
runSubagent({
  agentName: "Git Repository Operations Agent",
  prompt: "Handle git operation: [specific operation] - branch creation, PR creation, commit management, etc.",
  description: "Execute git repository operation"
})
```

**Key Operations** (8 Distinct Steps):
1. **Step 1: Check Changes** - Review all modified files and statistics
2. **Step 2: Sync with Main** - Fetch and update branch with latest main
3. **Step 3: Organize Files** - Group related changes logically
4. **Step 4: Stage and Commit** - Create conventional commits
5. **Step 5: Verify and Build** - Run lint and build checks
6. **Step 6: Push to Remote** - Deploy branch to origin
7. **Step 7: Create PR** - Generate pull request with detailed narrative
8. **Step 8: Share PR Link** - Display PR information for review

**Constraints**:
- Single repository scope (SailsHr)
- Feature branches only (no main modifications)
- PR target: always `main`
- Conventional commit format required
- Build must pass before PR creation
- MCP GitHub tools used for all GitHub API operations
- No external CLI tools (GitHub CLI) required

**Status**: Active

---

### 2. Create PR Agent

**File**: [.github/create-pr-agent.md](.github/create-pr-agent.md)

**Description**: 
Automatically creates pull requests from ticket descriptions using custom MCP server and the Git Repository Operations Agent.

**Purpose**: 
Convert ticket descriptions into complete, production-ready pull requests with zero manual intervention.

**Workflow**:
1. Parse ticket description
2. Create feature branch
3. Implement changes
4. Delegate to Git Repository Operations Agent for:
   - Check changes
   - Sync with main
   - Organize files
   - Stage and commit
   - Verify and build
   - Push to remote
   - Create PR
   - Share PR link

**Invocation**:
Direct user request or automated ticket processing:
```
User: "Create a PR for TICKET-456"
Or
"Process this ticket description and create a PR"
```

**Input**:
Ticket description containing:
- Ticket ID (e.g., TICKET-456)
- Feature/bug/refactor description
- Implementation requirements

**Output**:
- Feature branch created and pushed
- Pull request created on GitHub
- PR URL displayed: `https://github.com/sitadevipadala984/SailsHr/pull/<number>`
- Ready for review

**Key Features**:
- Zero manual approval required
- Follows SailsHr code conventions
- Conventional commit format
- Proper PR title and body
- Includes ticket reference (Closes TICKET-XXX)
- Build verification before PR
- Full automation via MCP
- Uses MCP GitHub tools (no CLI required)
- Creates PRs via GitHub API directly

**Constraints**:
- Must invoke Git Repository Operations Agent
- Cannot bypass git operations
- Build must pass
- PR target always main
- Requires GITHUB_TOKEN
- Uses MCP GitHub tools (no GitHub CLI)
- All GitHub operations via MCP protocol

**Status**: Active

---

## Agent Coordination

### Hierarchy
```
User Request
    ↓
Create PR Agent (Main Entry Point)
    ├─ Parse ticket
    ├─ Implement changes
    └─ Delegate to Git Repository Operations Agent
         ├─ Check changes
         ├─ Sync with main
         ├─ Organize files
         ├─ Stage and commit
         ├─ Verify and build
         ├─ Push to remote
         ├─ Create PR
         └─ Share PR link
```

### Communication
- **Create PR Agent** → **Git Repository Operations Agent** via `runSubagent()`
- **No other agent invocations** permitted
- Git Repository Operations Agent is internal and cannot be invoked directly by users

### Error Handling
- Git operations failures → Reported to Create PR Agent
- Create PR Agent decides retry or abort
- Errors logged with context
- Clear failure messages to user

---

## MCP Server Integration

### Configuration
Location: `.github/.mcp.json`

```json
{
  "mcpServers": {
    "sails-hr-git-operations": {
      "command": "node",
      "args": [".github/git-operations-mcp-server.js"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

### Available Tools
- `check_changes` - Review file modifications
- `sync_with_main` - Fetch and update from main
- `organize_files` - Group related changes
- `stage_and_commit` - Prepare commits
- `verify_and_build` - Run checks
- `push_to_remote` - Deploy branch
- `create_pull_request` - Generate PR
- `share_pr_link` - Display PR URL

---

## Requirements for All Agents

- `GITHUB_TOKEN` environment variable (with repo permissions)
- Node.js installed
- Git installed and configured
- MCP server running (`.github/git-operations-mcp-server.js`)
- Copilot with MCP tools enabled

---

## Future Roadmap

Potential agents for future implementation:
- **Code Review Agent** - Automated PR review and suggestions
- **Test Coverage Agent** - Verify test coverage and run tests
- **Documentation Agent** - Auto-generate and update docs
- **Release Agent** - Manage versioning and releases
- **Deployment Agent** - Handle deployments and rollbacks

---

## Key Artifacts

### Agent Definitions
- [create-pr-agent.md](.github/create-pr-agent.md) - Main PR creation agent
- [git-operations-agent.md](.github/git-operations-agent.md) - Reusable git operations agent

### Templates & Checklists
- [PULL_REQUEST_TEMPLATE.md](.github/PULL_REQUEST_TEMPLATE.md) - Comprehensive PR template with sections:
  - What Changed (Summary & Comparison)
  - Problem or Feature (Bug fix/Feature description)
  - Type of Change (Bug fix, Feature, Refactoring, Docs, Performance, Security, etc.)
  - Technical Details (Architecture & Design)
  - Testing (Instructions & Coverage)
  - **Code Quality Checklist** (Standards, Best Practices, Performance, Security, Docs, Accessibility)
  - Deployment & Rollout
  - Screenshots & Documentation
  - Final submission checklist

### Configuration
- [.mcp.json](.github/.mcp.json) - MCP server configuration
- [git-operations-mcp-server.js](.github/git-operations-mcp-server.js) - Git operations MCP handler
- [sails-hr-mcp-server.js](.github/sails-hr-mcp-server.js) - Legacy MCP (being replaced)

---

## Maintenance

**Last Updated**: March 5, 2026
**Version**: 1.0
**Owner**: SailsHr Development Team

For updates or new agents, modify this file and the corresponding agent definition files.
