# Contributing to ASU Secure Superadmin

Thank you for your interest in contributing to this project! Please follow these guidelines to ensure a smooth contribution process.

## Pull Request Requirements

### PR Title Format

All pull requests **must** have titles that follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification:

```
<type>(<scope>): <description>
```

#### Types

Choose one of the following types:

- **a11y**: Accessibility improvements
- **fix**: Bug fixes that patch issues in the codebase
- **feat**: New features being introduced
- **chore**: Maintenance tasks, documentation updates, refactoring, etc.

#### Scopes

A scope is **required** and must be one of:

- **webspark**: Changes made by the Webspark team
- **partner**: Changes made by Trusted Partners

#### Examples

```
feat(webspark): Add new button component
fix(partner): Resolve navigation issue in menu
a11y(webspark): Improve form field labels for screen readers
chore(webspark): Update documentation for configuration
```

### Jira Ticket Requirement

**For Webspark team PRs only** (scope: `webspark`), a Jira ticket is **required**.

1. Include the full Jira URL in your PR description using this format:
   ```
   https://asudev.jira.com/browse/PROJECT-123
   ```

2. The GitHub workflow will automatically:
   - Validate that a Jira ticket URL is present
   - Extract the ticket ID (e.g., `WS-1234`)
   - Inject it into your PR title if not already present

3. Your final PR title will look like:
   ```
   feat(webspark): [WS-1234] Add new button component
   ```

**Note**: Partner PRs (scope: `partner`) do not require a Jira ticket.

### Automated Checks

When you open or update a pull request, automated workflows will:

1. ✅ Validate your PR title follows the conventional commit format
2. ✅ Check for required scope (`webspark` or `partner`)
3. ✅ For `webspark` scope: Verify Jira ticket URL is present and inject the ticket ID into the title
4. ❌ Fail the check and comment on your PR if requirements aren't met

If the automated check fails, please:
- Review the error message in the PR comment
- Update your PR title and/or description as needed
- The workflow will automatically re-run on changes

## Code Standards

- Follow existing code style and conventions
- Test your changes thoroughly
- Document new features or significant changes
- Ensure no new errors are introduced (PHP, JavaScript, accessibility)

## Questions?

If you have questions about these requirements or need help, please reach out to the Webspark team.

