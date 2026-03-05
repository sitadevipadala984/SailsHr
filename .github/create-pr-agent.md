# Create PR Agent (Fully Automated via Custom MCP)

This agent automatically creates pull requests from ticket descriptions using a custom MCP server and the Git Repository Operations Agent.

**Zero manual approval required** - everything runs automatically through MCP and delegated git operations.

## Agent Details

- **Primary Role**: Convert ticket descriptions into complete pull requests
- **Delegation**: Uses `Git Repository Operations Agent` for all git operations
- **Invocation**: Direct user request or ticket processing workflow
- **Process**: Fully automated, no manual approval steps

## Automated Workflow

**CRITICAL: This agent MUST complete the entire PR flow without stopping. Do NOT stop after pushing the branch - PR creation must follow immediately.**

### Pull Request Flow (Sequential)
1. **Check Changes** - Review modified files and status
2. **Sync with Main** - Ensure branch has latest main updates
3. **Organize Files** - Group related changes logically
4. **Stage and Commit** - Prepare commits with conventional format
5. **Verify and Build** - Run lint and build checks
6. **Push to Remote** - Push feature branch to origin
7. **Create PR** - Create pull request via MCP
8. **Share PR Link** - Display PR URL for review

### 1. Parse Ticket Description
Copilot automatically:
- Extracts ticket ID and title
- Identifies change type (feature, bugfix, refactor, etc.)
- Understands the required implementation

### 2. Create Feature Branch
Invokes Git Repository Operations Agent:
- Format branch name as: `<type>/<ticket-id>-<short-description>`
- Example: `feature/TICKET-123-add-employee-dashboard`
- Create branch from `main`

### 3. Implement Changes
Copilot automatically:
- Modifies files based on ticket requirements
- Follows code conventions from copilot-instructions.md
- Keeps changes focused and logical

### 4. Check Changes
Git Repository Operations Agent executes:
- List all modified files
- Show diff summary
- Identify staged vs unstaged changes
- Report file organization status

### 5. Sync with Main
Git Repository Operations Agent executes:
- Fetch latest from remote
- Compare current branch with main
- Identify any merge conflicts
- Update branch with latest main changes

### 6. Organize Files
Git Repository Operations Agent executes:
- Analyze file changes
- Group related modifications logically
- Prepare for conventional commits
- Identify which files to stage

### 7. Stage and Commit
Git Repository Operations Agent executes:
- Stage selected files
- Create conventional commit message: `type(scope): description - Closes TICKET-XXX`
- Examples:
  - `feat(employee): add dashboard title - Closes TICKET-001`
  - `fix(attendance): correct date format - Closes TICKET-055`

### 8. Verify and Build
Git Repository Operations Agent executes:
- Run linting checks (`npm run lint`)
- Run build verification (`npm run build`)
- Fix any auto-fixable errors
- Report build status
- Abort on critical errors

### 9. Push to Remote
Git Repository Operations Agent executes:
- Push feature branch to origin
- Verify push success
- Confirm branch availability on remote
- Display push summary

### 10. Create Pull Request
Git Repository Operations Agent immediately executes (NO DELAY):
- Extract PR title from latest commit using conventional commit format
- Build comprehensive, narrative-based PR body with story-like description:
  - **Executive Summary**: What changed and the business impact
  - **Problem Statement**: Context and background of the issue
  - **Solution Overview**: How the solution addresses the needs
  - **Changes Made**: Detailed narrative of modifications:
    - Component/file changes in story format
    - What changed and why
    - How each change contributes to the solution
    - Any business logic improvements
    - UI/UX enhancements
    - New utilities or helper functions
    - Refactoring improvements
  - **Technical Implementation**: Design decisions and approach
  - **Files Affected**: Complete list with line counts and descriptions
  - **Testing Instructions**: Step-by-step verification guide
  - **Breaking Changes**: Any compatibility concerns
  - **Deployment Notes**: Any special deployment considerations
  - **Closes**: Ticket reference (Closes TICKET-XXX)
- Call MCP's `create_pull_request` with:
  - **title**: Conventional commit format (feat/fix/refactor scope: description)
  - **body**: Full narrative PR description (not just bullet points)
  - **head**: Feature branch name
  - **base**: `main`
  - **owner**: `sitadevipadala984`
  - **repo**: `SailsHr`

### 11. Share PR Link
Git Repository Operations Agent executes:
- Display PR URL: `https://github.com/sitadevipadala984/SailsHr/pull/<number>`
- Provide PR summary with key details
- Indicate PR is ready for review
- Process complete

## Agent Delegation

This agent delegates all git operations to the **Git Repository Operations Agent** via `runSubagent()`:

```javascript
runSubagent({
  agentName: "Git Repository Operations Agent",
  prompt: "Handle git operation: [operation] - check changes, sync main, stage and commit, verify build, push remote, create PR, share link",
  description: "Execute git repository operation"
})
```

**Invocation Points:**
1. After implementation → Delegate for: check changes, sync, organizing
2. Before pushing → Delegate for: staging, committing, verification
3. Final PR creation → Delegate for: push, create PR, share link

## Integration via Custom MCP Server

The custom MCP server is configured in `.github/.mcp.json`:
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

**Available MCP Tools:**
- `check_changes` - Review modified files and status
- `sync_with_main` - Fetch and update from main
- `organize_files` - Group related changes
- `stage_and_commit` - Stage files and create commits
- `verify_and_build` - Run lint and build checks
- `push_to_remote` - Push branch to origin
- `create_pull_request` - Create PR via GitHub API
- `share_pr_link` - Display PR information

**How it works:**
1. Create PR Agent handles ticket parsing and implementation
2. Delegates git operations to Git Repository Operations Agent
3. Git ops agent uses MCP tools for git and GitHub API
4. No terminal approval required - fully automated
5. All operations logged and reversible

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
1. ✅ Parses ticket → Extracts TICKET-456 and "add leave balance widget"
2. ✅ Creates feature branch → `feature/TICKET-456-add-leave-balance-widget`
3. ✅ Implements the widget code:
   - Creates `leave-balance-widget.tsx` component
   - Adds leave balance calculation utilities
   - Integrates with dashboard
   - Adds styling with Tailwind CSS
4. ✅ Delegates to Git Repository Operations Agent:
   - ✅ Checks changes → Lists 3 modified files, 245 insertions
   - ✅ Syncs with main → Fetches latest updates, no conflicts
   - ✅ Organizes files → Groups component, service, and test changes
   - ✅ Stages and commits → Creates conventional commits
   - ✅ Verifies and builds → Passes lint and build checks
   - ✅ Pushes to remote → Pushes feature branch to origin
   - ✅ Creates pull request → PR created with detailed narrative
   - ✅ Shares PR link → Displays PR URL

**Output:** ✅ PR #123 created with comprehensive story-based description

```
PR #123
URL: https://github.com/sitadevipadala984/SailsHr/pull/123
Title: feat(leave): add employee leave balance widget

## Executive Summary
This PR introduces a leave balance widget for the employee dashboard, providing employees 
with instant visibility into their leave usage. The widget displays available leave days, 
used leave, and a trend chart showing historical leave patterns. This directly addresses 
employee requests for better leave tracking and reduces support inquiries about leave balances.

## Problem Statement
Previously, employees had no quick way to check their leave balance from the dashboard. They 
had to navigate to a separate leave management page or contact HR to understand their leave 
status. This created friction in the user experience and increased HR workload with leave 
balance inquiries.

## Solution Overview
We've implemented a leave balance widget component that:
- Displays available, used, and total leave at a glance
- Shows a visual trend of leave usage over the past 3 months
- Integrates seamlessly with the existing employee dashboard
- Provides a smooth, interactive user experience with loading states
- Fetches data from the attendance management system in real-time

## Changes Made

### Component Implementation
**File: `apps/frontend/app/(authenticated)/employee/components/leave-balance-widget.tsx`**
- Created new React component that displays leave balance information
- Implemented card-based UI following dashboard design patterns
- Added loading skeleton while fetching data from API
- Integrated with existing leave data service for real-time updates
- Responsive design that works on mobile and desktop
- Added accessibility attributes (aria-labels, roles)
- Error boundary handling for failed data fetches

### Data Service Enhancement
**File: `apps/frontend/lib/leave-service.ts`**
- Added `getLeaveBalance()` function to fetch employee leave data
- Implemented `getLeaveHistory()` for trend calculation
- Added caching mechanism to reduce API calls
- Proper error handling and retry logic
- Type-safe API responses

### Dashboard Integration
**File: `apps/frontend/app/(authenticated)/employee/page.tsx`**
- Imported and added leave balance widget to dashboard grid
- Positioned widget in prominent location (top right)
- Added responsive grid layout to accommodate new widget
- Updated dashboard layout styles to prevent overflow

### Styling
- Used Tailwind CSS utility classes consistent with dashboard theme
- Added custom gradients for visual appeal
- Implemented dark mode support
- Proper spacing and typography following design system

## Technical Implementation

### Architecture
- Component uses React hooks (useState, useEffect, useCallback) for state management
- Custom hook `useLeaveBalance()` abstracts data fetching logic
- Implements error boundary pattern for graceful error handling
- Integrates with existing authentication context

### Data Flow
1. Widget mounts → triggers `useLeaveBalance()` hook
2. Hook fetches current user's leave balance via API
3. Data cached for 5 minutes to reduce server load
4. Component re-renders with leave information
5. User can click to expand detailed view

### Performance Considerations
- Memoized component to prevent unnecessary re-renders
- Lazy loading of trend chart data
- API response caching reduces load on backend
- Optimized SVG chart rendering for smooth animations

## Files Affected

| File | Type | Impact |
|------|------|--------|
| `apps/frontend/app/(authenticated)/employee/components/leave-balance-widget.tsx` | New | 245 lines - New widget component |
| `apps/frontend/lib/leave-service.ts` | Modified | 89 lines added - New API methods |
| `apps/frontend/app/(authenticated)/employee/page.tsx` | Modified | 15 lines changed - Dashboard integration |
| `apps/frontend/components/ui/Card.tsx` | Modified | 8 lines changed - Added shadow variant |

**Total**: +357 insertions, -8 deletions

## Testing Instructions

### Manual Verification
1. Navigate to employee dashboard
2. Leave balance widget should appear in top-right corner
3. Verify widget displays:
   - Current available leave (number)
   - Used leave this month (number)
   - Total leave balance (number)
   - 3-month trend visualization
4. Test user interactions:
   - Click "View Details" → Should expand to full leave history
   - Test on mobile view → Should stack properly
   - Load with no internet → Should show error gracefully
5. Test with different leave data:
   - Employee with lots of leave available
   - Employee with minimal leave left
   - Employee with no leave data

### Browser Testing
- Chrome (Latest)
- Firefox (Latest)
- Safari (Latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

### Performance Testing
- Widget should load in < 500ms
- Dashboard should not lag with widget present
- Trend chart animation should be smooth (60 FPS)

## Deployment Notes
- Database: No schema changes needed
- API compatibility: Uses existing `/api/employee/leave` endpoint
- Configuration: No new environment variables
- Feature flagging: Can be behind feature flag if needed for gradual rollout

## Closes
Closes #TICKET-456

---
Status: Ready for Review
```

## Requirements

- `GITHUB_TOKEN` environment variable set with repo permissions
- Node.js installed
- Custom MCP servers:
  - `.github/git-operations-mcp-server.js` (handles git operations)
- MCP GitHub tools available:
  - `mcp_github_repo_createpullrequest` - Create pull requests
  - `mcp_github_repo_updatepullrequest` - Update pull request metadata
  - `mcp_github_repo_getpullrequest` - Retrieve PR information
- Copilot with MCP tools enabled
- Git Repository Operations Agent available
- Repository structure following SailsHr conventions

**Note**: GitHub CLI is NOT required. All GitHub operations use MCP tools directly via the GitHub API.

## PR Body Generation Guidelines

The PR description should tell a compelling story about the changes, not just list them. Follow the structure from [PULL_REQUEST_TEMPLATE.md](.github/PULL_REQUEST_TEMPLATE.md) as a baseline and expand each section with narrative details:

### Required Sections (In Order):

### 1. Executive Summary (2-3 sentences)
- What was changed
- Business impact and value delivered
- Why this matters to the team or users

**Example**: "This PR introduces a leave balance widget for the employee dashboard, providing employees with instant visibility into their leave usage. The widget displays available leave days, used leave, and a trend chart showing historical leave patterns. This directly addresses employee requests for better leave tracking and reduces support inquiries about leave balances."

### 2. Problem Statement (2-3 sentences)
- Why was this change needed?
- What problem does it solve?
- What was the user's pain point?

**Example**: "Previously, employees had no quick way to check their leave balance from the dashboard. They had to navigate to a separate leave management page or contact HR to understand their leave status. This created friction in the user experience and increased HR workload with leave balance inquiries."

### 3. Solution Overview (3-5 bullet points)
- High-level approach to solving the problem
- Key features or capabilities
- Technology choices if relevant

**Example**:
- Displays available, used, and total leave at a glance
- Shows a visual trend of leave usage over the past 3 months
- Integrates seamlessly with the existing employee dashboard
- Provides a smooth, interactive user experience with loading states
- Fetches data from the attendance management system in real-time

### 4. Changes Made (Detailed narrative by file)
For each file changed or created:
- **File path** with context (New/Modified/Deleted)
- **What** was changed (functions, components, logic)
- **Why** it was changed that way
- **Impact** on the system

**Format**:
```
### [Feature Name]
**File: `path/to/file.tsx`** (New/Modified)
- What: Description of what was added/changed
- Why: Explanation of design decision
- Impact: How it affects the system
- Technical details: Any important implementation notes
```

### 5. Technical Implementation (If complex)
- Architecture decisions
- Design patterns used
- Data flow if relevant
- Performance considerations
- Error handling approach

### 6. Files Affected (Table format)
Create a table showing:
| File | Type | Impact |
|------|------|--------|
| file path | New/Modified/Deleted | Brief description and line count |

Include summary: Total insertions, deletions, files changed

### 7. Testing Instructions (Practical steps)
- Step-by-step verification guide
- What users should see
- Edge cases to test
- Browser/device compatibility if relevant
- Performance testing if applicable

**Format**:
```
### Manual Verification
1. Navigate to [location]
2. Verify [expected behavior]
3. Test [interaction]
4. Check [edge case]

### Browser Testing
- Chrome (Latest)
- Firefox (Latest)
- Safari (Latest)

### Performance Testing
- Should load in < Xms
- No console errors
- Smooth animations (60 FPS)
```

### 8. Breaking Changes (If any)
- List any backward compatibility concerns
- Migration path for existing implementations
- Deprecation notices if relevant
- Timeline for removal if applicable

### 9. Deployment Notes (If relevant)
- Database migration requirements
- Environment variable changes
- Configuration updates
- Feature flags
- Rollback plan

### 10. References
- Closes #TICKET-ID
- Related PRs or issues
- Documentation links
- Design files (Figma, etc.)

## Notes

- **Zero manual approval** - Everything runs through MCP and agent delegation
- Changes pushed to feature branch first
- PR created against `main` (default branch)
- Git ops agent handles all repository operations
- Feature branch cleaned up after merge (optional)
- Industry-standard automation via MCP protocol and agent orchestration

## Mandatory Agent Instructions

**WHEN RUNNING THIS AGENT, YOU MUST FOLLOW THIS SEQUENCE WITHOUT EXCEPTION:**

### Phase 1: Ticket Processing
1. Parse ticket description and extract:
   - Ticket ID (e.g., TICKET-456)
   - Title and requirements
   - Change type: feature, bugfix, refactor, etc.

2. Create appropriately named feature branch:
   - Format: `type/TICKET-ID-short-description`
   - Example: `feature/TICKET-456-add-widget`

### Phase 2: Implementation
3. Implement required changes following code conventions

### Phase 3: Git Operations (MUST use Git Repository Operations Agent)
4. **DO NOT perform git operations directly** - delegate to Git Repository Operations Agent:
   ```javascript
   runSubagent({
     agentName: "Git Repository Operations Agent",
     prompt: `Execute the following git operations in strict order for TICKET-456:

STEP 1: Check Changes
- List all modified files (git status)
- Show diff summary (git diff --stat)
- Report file change statistics
- Output: File list with line counts

STEP 2: Sync with Main
- Fetch latest from remote (git fetch origin)
- Compare current branch with main
- Identify any merge conflicts
- Update branch with latest main updates
- Output: Sync status or conflict report

STEP 3: Organize Files
- Analyze all file changes holistically
- Group related modifications logically
- Identify patterns and interconnections
- Prepare narrative themes for PR body
- Output: Organized file groups with context

STEP 4: Stage and Commit
- Stage all modified files (git add .)
- Create conventional commit: feat(scope): description - Closes TICKET-456
- Output: Commit message and status

STEP 5: Verify and Build
- Run linting checks (npm run lint)
- Run build verification (npm run build)
- Fix auto-fixable errors
- Output: Build status (pass/fail)

STEP 6: Push to Remote
- Push feature branch to origin
- Verify push success
- Confirm branch availability on remote
- Output: Push confirmation and URL

STEP 7: Create Pull Request
- Extract PR title from latest commit
- Build comprehensive narrative PR body:
  * Executive Summary: What + Business Impact (2-3 sentences)
  * Problem Statement: Why this was needed (2-3 sentences)
  * Solution Overview: How we solved it (3-5 points)
  * Changes Made: Detailed file-by-file narrative explaining WHAT changed, WHY it changed, and the IMPACT
  * Technical Implementation: Design decisions, approach, performance considerations
  * Files Affected: Table with paths, types (New/Modified), and descriptions
  * Testing Instructions: Step-by-step verification guide
  * Breaking Changes: Any compatibility concerns
  * Deployment Notes: Database changes, env vars, rollback plan
- Create PR with:
  * title: Conventional commit format
  * body: Full narrative description (story-based, not just bullets)
  * head: feature/TICKET-456-add-leave-balance-widget
  * base: main
  * owner: sitadevipadala984
  * repo: SailsHr
- Output: PR number and URL

STEP 8: Share PR Link
- Display PR URL: https://github.com/sitadevipadala984/SailsHr/pull/<number>
- Provide PR summary with key details
- Indicate PR is ready for review
- Output: PR link and completion confirmation

EXECUTION REQUIREMENTS:
- Execute steps strictly in order (1→2→3→4→5→6→7→8)
- Do NOT skip any step
- Do NOT stop after Step 6 (push) - must continue to PR creation
- PR description MUST be narrative-based (tell a story, not just list bullet points)
- All sections in PR body must be included
- Wait for each step to complete before proceeding to next
- Report any errors immediately with context
- Return final PR URL and confirmation when complete`,
     description: "Execute 8-step git PR creation flow with detailed narrative description"
   })
   ```

5. **Verify all steps completed** in order:
   - ✅ Step 1: Check Changes
   - ✅ Step 2: Sync with Main
   - ✅ Step 3: Organize Files
   - ✅ Step 4: Stage and Commit
   - ✅ Step 5: Verify and Build
   - ✅ Step 6: Push to Remote
   - ✅ Step 7: Create Pull Request
   - ✅ Step 8: Share PR Link

6. **Verify PR description quality** before terminating:
   - Narrative flows logically
   - Business impact is clear
   - All files documented with context
   - Testing instructions are comprehensive
   - Technical decisions explained

### Critical Rules

- **DO NOT STOP after pushing the branch!** The agent delegation must continue through PR creation
- **PR creation MUST follow immediately** after push_branch succeeds
- **Use runSubagent() for all git operations** - never use terminal git commands directly
- **Wait for Git Repository Operations Agent to complete** before terminating
- **If delegation fails**, capture error and retry or abort with clear error message
- **The workflow is incomplete if no PR link is shared** at the end

**If you stop after push_branch without creating the PR, the automation is incomplete and the workflow has FAILED.**
