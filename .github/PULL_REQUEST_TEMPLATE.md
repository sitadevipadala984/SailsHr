## What Changed?

### Summary
Provide a clear and concise description of the changes made in this pull request.

### Comparison with Main
- **Lines Added**: X+
- **Lines Deleted**: X-
- **Files Modified**: X files
- **Key Changes**:
  - Change 1 description
  - Change 2 description
  - Change 3 description

---

## Problem or Feature

### Problem This Solves (for bug fixes)
*If this is a bug fix, describe the problem being solved:*
- What was the issue?
- How did it impact users or the system?
- Why was it critical to fix?

### Feature This Adds (for new features)
*If this is a new feature, describe what's being added:*
- What new capability does this provide?
- What user problem does it solve?
- How does it improve the system?

### Related Issue
Closes #TICKET-XXX

---

## Type of Change

Select the type(s) of change(s) in this PR:

- [ ] 🐛 **Bug Fix** - Fixes an existing issue or defect
- [ ] ✨ **New Feature** - Adds new functionality
- [ ] 🔄 **Refactoring** - Code restructuring without behavior changes
- [ ] 📚 **Documentation** - Documentation updates or additions
- [ ] ⚡ **Performance Improvement** - Improves performance or optimizes code
- [ ] 🔒 **Security Fix** - Addresses security vulnerabilities
- [ ] 🎨 **UI/UX Enhancement** - Visual or user experience improvements
- [ ] 🧪 **Test Improvements** - Adds or updates tests
- [ ] 🛠️ **Build/DevOps** - Build process or CI/CD changes

---

## Technical Details

### Architecture & Design Decisions
*Explain the technical approach and why this solution was chosen:*

- **Approach**: [Describe the overall approach]
- **Design Pattern**: [Any patterns used - e.g., Observer, Strategy, etc.]
- **Key Components**: [Main components involved]
- **Performance Impact**: [Any performance implications]
- **Scalability Considerations**: [How this scales with load]

### Dependencies
- [ ] Does this add new dependencies? If yes, list them:
  - dependency1 (version)
  - dependency2 (version)

### Breaking Changes
- [ ] Does this introduce breaking changes?
- [ ] If yes, what needs to be migrated?

---

## Testing

### How to Test
*Provide step-by-step instructions for testing this PR:*

```
1. Step to reproduce or verify change
2. Expected behavior
3. How to verify it works
4. Edge cases to test
```

### Test Coverage
- [ ] Unit tests written
- [ ] Integration tests written
- [ ] Manual testing completed
- [ ] Test coverage: X% (before/after)

### Browsers/Devices Tested
- [ ] Chrome (Latest)
- [ ] Firefox (Latest)
- [ ] Safari (Latest)
- [ ] Mobile (iOS/Android)
- [ ] Other: ____________

### Edge Cases Tested
- [ ] Null/undefined values
- [ ] Empty data
- [ ] Large datasets
- [ ] Network failures
- [ ] Concurrent operations
- [ ] Other: ____________

---

## Code Quality Checklist

### Code Standards
- [ ] Code follows project conventions
- [ ] Code is properly formatted
- [ ] No hard-coded values (use constants)
- [ ] No commented-out code
- [ ] No debug console.log() statements

### Best Practices
- [ ] DRY principle - No code duplication
- [ ] SOLID principles followed
- [ ] Proper error handling implemented
- [ ] Null/undefined checks in place
- [ ] Type safety (TypeScript types complete)

### Performance
- [ ] No N+1 database queries
- [ ] No unnecessary re-renders (React)
- [ ] Proper caching implemented
- [ ] API calls optimized
- [ ] Bundle size impact acceptable

### Security
- [ ] No hardcoded secrets/tokens
- [ ] Input validation implemented
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (output encoding)
- [ ] CSRF protection verified
- [ ] Authentication/Authorization checks present

### Documentation
- [ ] Code comments for complex logic
- [ ] JSDoc/TSDoc comments added
- [ ] README updated if needed
- [ ] Configuration documented
- [ ] API documentation updated

### Accessibility
- [ ] ARIA labels added (if UI change)
- [ ] Keyboard navigation tested (if UI change)
- [ ] Screen reader compatible (if UI change)
- [ ] Color contrast passes WCAG standards (if UI change)

### Accessibility Compliance
- [ ] WCAG 2.1 AA compliant (if applicable)
- [ ] Semantic HTML used
- [ ] Form labels properly associated
- [ ] Error messages descriptive

---

## Deployment & Rollout

### Deployment Notes
- **Database Migrations**: None / Required (describe)
- **Environment Variables**: None / Required (list)
- **Configuration Changes**: None / Required (describe)
- **Service Restarts**: None / Required (specify)
- **Rollback Plan**: [Describe how to rollback if needed]

### Feature Flags
- [ ] Protected behind feature flag? If yes:
  - Flag name: ____________
  - Rollout stages: [Describe rollout plan]

### Monitoring
- [ ] New metrics/alerts added? If yes:
  - Metric: ____________
  - Alert threshold: ____________

---

## Reviewers

### Self-Review Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code where necessary
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works

### Suggested Reviewers
- @frontend-team (for UI changes)
- @backend-team (for API changes)
- @devops-team (for infrastructure changes)
- Other: ____________

### Review Focus Areas
*Highlight what reviewers should pay special attention to:*

1. Focus area 1 - Why it needs attention
2. Focus area 2 - Why it needs attention
3. Focus area 3 - Why it needs attention

---

## Screenshots (if applicable)

### Before
*Add screenshots showing the before state (for UI changes):*

[Screenshot placeholder]

### After
*Add screenshots showing the after state (for UI changes):*

[Screenshot placeholder]

---

## Related Documentation

- [Design Document](link-placeholder)
- [API Documentation](link-placeholder)
- [Architecture Decision Record](link-placeholder)
- [Migration Guide](link-placeholder)

---

## Video Demo (optional)

For complex feature PRs, consider adding a video walkthrough:
[Video link placeholder]

---

## Checklist Before Submission

- [ ] PR title follows conventional commit format: `type(scope): description`
- [ ] All tests pass locally
- [ ] Build succeeds without errors
- [ ] No console errors or warnings
- [ ] Code follows project standards
- [ ] Documentation is complete
- [ ] All checklist items reviewed
- [ ] Ready for code review

---

## Additional Context

*Add any other context, links, or information that would be helpful for reviewers:*

[Additional context goes here]

---

**Thank you for contributing! 🎉**
