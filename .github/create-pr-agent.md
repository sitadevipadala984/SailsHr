# Create PR Agent (Fully Automated via Custom MCP)

This agent automatically creates pull requests from ticket descriptions using a custom MCP server.

**Zero manual approval required** - everything runs automatically through MCP.

## Automated Workflow

**CRITICAL: Do NOT stop after pushing the branch. You MUST create the PR immediately after push_branch succeeds.**

### 1. Parse Ticket Description
Copilot automatically:
- Extracts ticket ID and title
- Identifies change type (feature, bugfix, refactor, etc.)
- Understands the required implementation

### 2. Create Feature Branch (via MCP)
Copilot uses custom MCP server to:
- Format branch name as: `<type>/<ticket-id>-<short-description>`
- Example: `feature/TICKET-123-add-employee-dashboard`
- Create branch from `main`
- Switch to new branch

### 3. Implement Changes
Copilot automatically:
- Modifies files based on ticket requirements
- Follows code conventions from copilot-instructions.md
- Keeps commits focused and logical

### 4. Lint and Build (via MCP)
Before committing, Copilot:
- Runs local linting (`npm run lint`)
- Runs build verification (`npm run build`)
- Fixes any errors before proceeding
- Aborts if build fails

### 5. Commit Changes (via MCP)
Copilot automatically:
- Uses conventional commit format
- Includes ticket reference: `Closes TICKET-123`
- Example: `feat(attendance): add calendar widget - Closes TICKET-123`

### 6. Push Branch to Remote (via MCP)
Copilot automatically:
- Pushes the feature branch to origin
- Makes the branch available for PR creation
- Does NOT stop here - proceeds directly to PR creation

### 7. Create Pull Request (via MCP) - AUTOMATIC, NO DELAY
**THIS STEP MUST RUN AUTOMATICALLY WITHOUT WAITING FOR USER APPROVAL**

Copilot immediately calls `create_pull_request` MCP tool with:
- **title**: `type(scope): description` (conventional commit format)
- **body**: Formatted with:
  - Clear description of changes
  - Why the change was made
  - Files affected
  - Testing instructions
  - "Closes TICKET-123" reference
- **head**: Feature branch name (e.g., `feature/TICKET-123-add-widget`)
- **base**: `main`
- **owner**: `sitadevipadala984`
- **repo**: `SailsHr`

After PR creation:
- Display PR number and URL
- Process complete - PR ready for review

## Custom MCP Server Integration

The custom MCP server is configured in `.github/.mcp.json`:
```json
{
  "mcpServers": {
    "sails-hr-automation": {
      "command": "node",
      "args": [".github/sails-hr-mcp-server.js"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

**Available MCP Tools:**
- `create_feature_branch` - Creates properly named feature branches
- `implement_ticket` - Placeholder for code implementation
- `run_lint_and_build` - Runs linting and build verification
- `commit_changes` - Commits with conventional format
- `push_branch` - Pushes branch to remote
- `create_pull_request` - Creates PR via GitHub API

**How it works:**
1. Copilot has access to custom MCP server tools
2. MCP server handles all git operations and GitHub API calls
3. No terminal approval required - fully automated
4. All operations run through MCP protocol

## Example: Fully Automated Ticket → PR

**Input (Ticket Description):**
```
🎫 TICKET-456: Add employee leave balance widget

The leave balance widget should display:
- Available leave days
- Used leave days
- Leave balance trend
Place this in the employee dashboard.
```

**Copilot Automatically (Zero Manual Steps):**
1. ✅ Calls `create_feature_branch` → `feature/TICKET-456-add-leave-balance-widget`
2. ✅ Implements the widget code
3. ✅ Calls `run_lint_and_build` → Verifies code quality
4. ✅ Calls `commit_changes` → `feat(leave): add balance widget - Closes TICKET-456`
5. ✅ Calls `push_branch` → Pushes to remote
6. ✅ **IMMEDIATELY** calls `create_pull_request` → PR created automatically with proper title and body
7. ✅ Displays PR URL for review

**Output:** ✅ PR #123 created and ready for review at https://github.com/sitadevipadala984/SailsHr/pull/123 (no manual approval needed)

## Requirements

- `GITHUB_TOKEN` environment variable set with repo permissions
- Node.js installed
- Custom MCP server (`.github/sails-hr-mcp-server.js`)
- Copilot with MCP tools enabled

## Notes

- **Zero manual approval** - Everything runs through MCP
- Changes pushed to feature branch first
- PR created against `main` (default branch)
- Feature branch cleaned up after merge
- Industry-standard automation via MCP protocol

## MANDATORY AGENT INSTRUCTIONS

**WHEN RUNNING THIS AGENT, YOU MUST FOLLOW THIS SEQUENCE WITHOUT EXCEPTION:**

1. **After `push_branch` succeeds**, DO NOT STOP
2. **Immediately extract the PR details:**
   - Title: Get the conventional commit message from the last commit
   - Body: Create a formatted body including:
     - Summary of changes
     - Which files were modified
     - Why this change was made
     - Testing steps (if applicable)
     - Include "Closes TICKET-XXX" reference
   - Head branch: The feature branch name you created (e.g., `feature/TICKET-456-add-widget`)
   - Base: Always `main`
   - Owner: `sitadevipadala984`
   - Repo: `SailsHr`

3. **Call `create_pull_request` MCP tool** with the extracted details
4. **Display the PR URL** and confirm completion
5. **Do NOT wait for user confirmation** - the workflow is fully automated

**If you stop after push_branch without creating the PR, the automation is incomplete and the workflow has FAILED.**

// test-mcp-tools.js
const message = {
  jsonrpc: "2.0",
  id: 1,
  method: "tools/list",
  params: {}
};

console.log(JSON.stringify(message));
