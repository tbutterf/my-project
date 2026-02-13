<!-- 
IMPORTANT: PR Title Requirements

Your PR title MUST follow the Conventional Commits format:

  <type>(<scope>): <description>

Types (choose one):
  - a11y: Accessibility improvements
  - fix: Bug fixes
  - feat: New features
  - chore: Maintenance, documentation, or refactoring

Scopes (choose one):
  - webspark: Changes by the Webspark team (requires Jira ticket below)
  - partner: Changes by Trusted Partners

Examples:
  feat(webspark): Add new button component
  fix(partner): Resolve navigation issue
  a11y(webspark): Improve form labels

Note: For webspark scope, include the Jira URL below and the workflow 
will automatically inject the ticket ID into your title.
-->

### Description

<!-- Please describe the solution this pull request provides. -->

### Links

**Jira Ticket** (required for commits with scope `webspark`)

<!-- 
Paste the full Jira URL here. The workflow will automatically extract and inject the ticket ID into your PR title.
Example: https://asudev.jira.com/browse/WS-1234
-->

### QA Steps

<!-- Please provide adequate steps to verify this pull request. -->

### Checklist

- [ ] Design matches [Unity Design System](https://unity.web.asu.edu)
- [ ] Design matches [Web Standards](https://xd.adobe.com/view/56f6cb78-9af5-4b12-b4ce-ef319f71113f-03a5)
- [ ] Solution is documented on Jira ticket
- [ ] QA steps to verify is documented on Jira ticket
- [ ] This pull request does not introduce new PHP errors
- [ ] This pull request does not introduce new JS errors
- [ ] This pull request does not introduce new A11y violations
- [ ] This pull request includes relevant documentation
- [ ] Included .yaml files have a matching update hook

### Verified in browsers

- [ ] Chrome
- [ ] Safari
- [ ] Firefox
- [ ] Edge

### Screenshots (if applicable)

<!-- Provide applicable screenshots only -->