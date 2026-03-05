# Git Repository Operations Agent

**Abstract:** Manages all git repository operations in a unified, reusable manner for automated workflows.

## Agent Description

This agent provides comprehensive git repository management including:
- **Branch Management** - Create, switch, merge, delete branches with proper naming conventions
- **Commit Management** - Stage files, commit with conventional formats, amend commits
- **Pull Requests** - Create, update, manage PR lifecycle and metadata
- **Tags** - Create, list, manage semantic version tags
- **Code Search** - Search across repository history and commits
- **Fork Management** - Handle fork-related operations and syncing
- **Sync Operations** - Keep branches synchronized with remote and main

## How to Invoke

**Only the `create-pr-agent` may invoke this agent via `runSubagent`:**

```javascript
runSubagent({
  agentName: "Git Repository Operations Agent",
  prompt: "Handle git operation: [user's request] - branch creation, PR creation, commit management, tag management, etc.",
  description: "Execute git repository operation"
})
```

## Core Operations - 8 Distinct Steps

### STEP 1: Check Changes
- List all modified files (`git status`)
- Show diff summary (`git diff --stat`)
- Report file change statistics
- Identify staged vs unstaged changes
- Report untracked files
- Analyze patterns in changes for narrative building
- **Output**: File list with line counts and change types

### STEP 2: Sync with Main
- Fetch latest from remote (`git fetch origin`)
- Compare current branch with main
- Identify merge conflicts if any
- Update current branch with latest main updates
- Document any conflict resolutions for PR body
- **Output**: Sync status or conflict report

### STEP 3: Organize Files
- Analyze all file changes holistically
- Group related modifications logically
- Identify patterns and interconnections
- Prepare narrative themes for PR body
- Map technical changes to business value
- **Output**: Organized file groups with conceptual themes

### STEP 4: Stage and Commit
- Stage all modified files (`git add .`)
- Create conventional commit message: `type(scope): description - Closes TICKET-XXX`
- Commit with proper formatting
- Examples:
  - `feat(employee): add dashboard title - Closes TICKET-001`
  - `fix(attendance): correct calendar date format - Closes TICKET-055`
  - `docs(api): update authentication flow - Closes TICKET-089`
- **Output**: Commit message and hash

### STEP 5: Verify and Build
- Run linting checks (`npm run lint`)
- Run build verification (`npm run build`)
- Fix any auto-fixable errors
- Report build status
- Abort on critical errors
- **Output**: Build status (pass/fail with details)

### STEP 6: Push to Remote
- Push feature branch to origin (`git push origin <branch>`)
- Verify push success
- Confirm branch availability on remote
- Display push summary
- **Output**: Push confirmation and remote URL

### STEP 7: Create Pull Request
**MUST NOT STOP HERE - Continue immediately to STEP 8**
**Uses MCP GitHub API - NO GitHub CLI required**

- Extract PR title from latest commit using conventional commit format
- Build comprehensive, narrative-based PR body:
  - **Executive Summary**: What changed and the business impact
  - **Problem Statement**: Context and background of the issue
  - **Solution Overview**: How the solution addresses the needs
  - **Changes Made**: Detailed narrative of modifications:
    - Component/file changes in story format
    - What changed and why
    - How each change contributes to the solution
    - Business logic improvements
    - UI/UX enhancements
    - New utilities or helper functions
    - Refactoring improvements
  - **Technical Implementation**: Design decisions and approach
  - **Files Affected**: Complete list with line counts and descriptions
  - **Testing Instructions**: Step-by-step verification guide
  - **Breaking Changes**: Any compatibility concerns
  - **Deployment Notes**: Any special deployment considerations

- Call MCP GitHub tool `mcp_github_repo_createpullrequest` with:
  ```json
  {
    "owner": "sitadevipadala984",
    "repo": "SailsHr",
    "title": "feat(scope): description",
    "body": "Full narrative PR description...",
    "head": "feature/TICKET-456-description",
    "base": "main"
  }
  ```

- **Output**: PR number, URL, and creation status

### STEP 8: Share PR Link
- Display PR URL in format: `https://github.com/sitadevipadala984/SailsHr/pull/<number>`
- Provide PR summary with key details
- Indicate PR is ready for review
- **Output**: PR link and completion confirmation

## MCP Integration

### Git Operations MCP Server
Configured in `.github/.mcp.json`:
```json
{
  "mcpServers": {
    "git-operations": {
      "command": "node",
      "args": [".github/git-operations-mcp-server.js"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "github": {
      "command": "node",
      "args": [".github/mcp-github.js"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

### Git Operations Tools
Local git operations (via git-operations-mcp-server.js):
- `check_changes` - Review modified files and status
- `sync_with_main` - Fetch and update from main
- `organize_files` - Group related changes
- `stage_and_commit` - Stage files and create commits
- `verify_and_build` - Run lint and build checks
- `push_to_remote` - Push branch to origin
- `share_pr_link` - Display PR information

### GitHub API Tools (MCP)
**NO GitHub CLI Required** - GitHub operations via MCP protocol:
- `mcp_github_repo_createpullrequest` - Create new pull request
  - Parameters: title, body, head (branch), base (target branch), owner, repo
  - Returns: PR number, URL, status
  - Example:
    ```json
    {
      "owner": "sitadevipadala984",
      "repo": "SailsHr",
      "title": "feat(scope): description",
      "body": "Full PR description...",
      "head": "feature/TICKET-456-description",
      "base": "main"
    }
    ```

- `mcp_github_repo_updatepullrequest` - Update PR title/body
  - Parameters: prNumber, updates (title/body)
  - Returns: Updated PR information
  
- `mcp_github_repo_getpullrequest` - Retrieve PR details
  - Parameters: prNumber, owner, repo
  - Returns: Full PR information
  
- `mcp_github_repo_addpullrequestlabels` - Add labels to PR
  - Parameters: prNumber, labels array
  - Returns: Confirmation
  
- `mcp_github_repo_requestreviewers` - Request reviewers
  - Parameters: prNumber, reviewers array
  - Returns: Confirmation

### How It Works

1. **Git Operations**: Handled locally via git-operations-mcp-server.js
   - Steps 1-6: All local git operations (check, sync, organize, stage, verify, push)
   - No external dependencies

2. **GitHub PR Creation**: Handled via MCP GitHub API (Step 7)
   - Uses `mcp_github_repo_createpullrequest` tool
   - Authenticates with GITHUB_TOKEN
   - Creates PR directly via GitHub REST API
   - No GitHub CLI installation required

3. **PR Management**: Can use additional MCP tools
   - Update PR metadata (labels, reviewers)
   - Retrieve PR information
   - Manage PR lifecycle

### Requirements
- `GITHUB_TOKEN` environment variable set with repo permissions
- Node.js installed
- Git installed and configured
- MCP protocol support in Copilot
- **GitHub CLI is NOT required** - All operations through MCP tools

## Advanced Operations

### Branch Operations
```
create_branch(type, ticketId, description)
  → feature/TICKET-123-add-feature
  → bugfix/TICKET-456-fix-bug
  → refactor/TICKET-789-improve-code

delete_branch(branchName)
merge_branch(sourceBranch, targetBranch)
list_branches(remote=false)
rename_branch(oldName, newName)
```

### Commit Management
```
stage_files(patterns)
  → Stage specific files or patterns
  
commit_changes(message, amend=false)
  → Commit with conventional format
  
rebase_interactive(baseRef)
  → Interactive rebase for cleanup
  
squash_commits(count)
  → Squash last N commits
```

### PR Description Generation (DETAILED NARRATIVE)

This is the core of high-quality PR body generation. The agent must:

**Step 1: Analyze Changes Holistically**
- Read all modified files
- Understand interconnections between changes
- Identify the overarching purpose
- Map technical changes to business value

**Step 2: Build Narrative Structure**

#### Executive Summary
- Extract business impact from commit messages and code changes
- Summarize what changed and why it matters
- One paragraph, 2-3 sentences maximum
- Use action verbs and concrete outcomes

#### Problem Statement
- Understand the context from commit messages and ticket description
- Identify the pain point being solved
- Document the "before" state
- Explain why this matters
- One paragraph, 2-3 sentences

#### Solution Overview
- Convert code changes into business-friendly language
- Highlight key features and capabilities
- List benefits to users or system
- Keep technical jargon minimal
- 3-5 bullet points

#### Changes Made (Detailed)
For each modified file:
- **File path** and type (New/Modified/Deleted)
- **What** specifically changed (functions, components, logic)
- **Why** that design was chosen (avoid redundancy with code)
- **Impact** on the system or user experience
- Include line counts if significant
- Group related files conceptually (not just alphabetically)

Example structure:
```
### Feature Name
**File: `path/to/component.tsx`** (New)
- **What**: Created new React component that displays X functionality
- **Why**: Previously users had to navigate to separate page; now integrated
- **Impact**: Improves user experience, reduces page load time by 30%
- **Technical**: Uses error boundary pattern, memoized for performance

**File: `path/to/service.ts`** (Modified)
- **What**: Added `fetchData()` function and caching logic
- **Why**: Reduce API calls from multiple page loads
- **Impact**: 50% reduction in API load during peak hours
- **Technical**: Implements 5-minute cache, proper error handling
```

#### Technical Implementation
- Architecture decisions and design patterns
- Data flow if complex
- Performance optimizations
- Error handling strategy
- Security considerations if any
- Integration points with existing systems

#### Files Affected (Table)
Create comprehensive table with:
- Exact file paths
- Type: New/Modified/Deleted
- Impact description: what changed and why
- Line counts: +X lines, -Y lines

#### Testing Instructions
- Step-by-step manual verification
- Expected behavior at each step
- Edge cases to test
- Cross-browser testing matrix
- Performance benchmarks if relevant
- Testing commands if automated tests exist

#### Deployment Notes
- Any database changes
- Environment variables
- Configuration updates
- Feature flags or gradual rollout
- Rollback procedure
- Compatibility notes

**Step 3: Review and Polish**
- Ensure narrative flows logically
- Check for technical accuracy
- Verify all files are documented
- Make sure business impact is clear
- Remove redundancy between sections

**Step 4: Generate PR Body**
- Combine all sections with proper formatting
- Use markdown headers for structure
- Include code blocks where relevant
- Add tables for file impact summary
- Keep total length reasonable (2000-3000 words max)
- Make it scannable with clear subsections

### PR Operations
```
create_pull_request(title, body, head, base)
  → title: Conventional commit format
  → body: Detailed narrative description (NOT just bullet points)
  → head: Feature branch name
  → base: main
  → Full story-based documentation
  
update_pull_request(prNumber, updates)
  → Update PR title/body with new information
  
list_pull_requests(state, head)
  → List PRs (open, closed, all)
  
add_pr_labels(prNumber, labels)
  → Add labels to PR based on type/scope
```

### Tag Operations
```
create_tag(tagName, description)
  → Create semantic version tag
  
list_tags(pattern)
  → List tags matching pattern
  
delete_tag(tagName)
  → Delete local and remote tag
  
push_tags()
  → Push all tags to remote
```

### Search Operations
```
search_commits(query)
  → Search commit messages
  
search_code(query, branch=main)
  → Search code across repository
  
find_by_author(author, branch=main)
  → Find commits by author
```

### Fork Management
```
sync_fork_with_upstream()
  → Update fork with upstream changes
  
create_pull_request_to_upstream()
  → Create PR against upstream
```

## MCP Server Integration

Configured in `.github/.mcp.json`:
```json
{
  "mcpServers": {
    "git-operations": {
      "command": "node",
      "args": [".github/git-operations-mcp-server.js"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

## Usage Examples

### Example 1: Basic PR Flow
```
Invoke: "Create PR from feature branch"

Agent executes:
1. git status → Check changes
2. git fetch origin → Sync with remote
3. git add . → Stage files
4. git commit → Conventional commit
5. npm run build → Verify build
6. git push origin feature/TICKET-001-add-feature → Push
7. create_pull_request() → Create PR
8. Display: PR #45 at https://github.com/sitadevipadala984/SailsHr/pull/45
```

### Example 2: Tag Release
```
Invoke: "Create release tag v1.2.3"

Agent executes:
1. git tag -a v1.2.3 -m "Release v1.2.3"
2. git push origin v1.2.3
3. Display: Tag v1.2.3 created and pushed
```

## Error Handling

- **Uncommitted changes**: Prompt user or auto-commit with WIP prefix
- **Merge conflicts**: Report conflicts and abort PR creation
- **Build failures**: Report error, allow fixing before retry
- **Network errors**: Retry push/fetch with backoff
- **Invalid branch names**: Suggest correction and retry

## Requirements

- `GITHUB_TOKEN` environment variable
- Node.js and npm installed
- Git installed and configured
- Custom MCP server running

## Constraints

- **Only invoked by**: create-pr-agent
- **Scope**: Single repository (SailsHr)
- **Branches**: Feature branches only (no direct main modifications)
- **PR target**: Always `main` branch
- **Commits**: Must follow conventional commit format
- **Build**: Must pass lint and build verification

## Notes

- All operations logged for debugging
- Reversible operations supported (revert, reset)
- Maintains git history integrity
- Follows company conventions
- Zero manual intervention required
