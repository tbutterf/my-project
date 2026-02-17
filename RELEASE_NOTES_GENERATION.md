# Multi-Label Release Notes Generation

This project includes two solutions for generating release notes that properly handle items appearing in multiple categories:

## Solution 1: Automated GitHub Action (Recommended for CI/CD)

The `.github/workflows/generate-release-notes.yml` workflow automatically generates release notes whenever a release is published on GitHub.

### How It Works

1. Listens for release publication events
2. Queries GitHub API for merged PRs since the previous release
3. Reads your `.github/release.yml` configuration
4. Groups PRs by all matching labels (not just the first match)
5. Updates the release body with formatted notes

### Setup

1. The workflow is already created and ready to use
2. Make sure your repository has the GitHub Actions permission to update releases
3. When you publish a release on GitHub, the workflow will automatically run

### Labels and Categories

PRs are included in **all matching categories**. For example:

- A PR with labels `webspark` + `feature` appears in:
  - "Webspark changes" (matches `webspark` label)
  - "Feature Development" (matches `feature` label)

- A PR with only `webspark` appears in:
  - "Webspark changes"

## Solution 2: Local Release Notes Generator (For Testing & Manual Releases)

The `scripts/generate-release-notes.js` script generates release notes locally, useful for testing or manual release processes.

### Setup

```bash
# Install dependencies
npm install

# Make script executable
chmod +x scripts/generate-release-notes.js
```

### Usage

```bash
# Generate release notes between two tags
GITHUB_TOKEN=<your-token> \
GITHUB_OWNER=asuwebplatforms \
GITHUB_REPO=asu_secure_superadmin \
npm run release-notes -- --from v1.0.0 --to v1.1.0

# Save to file
GITHUB_TOKEN=<your-token> \
GITHUB_OWNER=asuwebplatforms \
GITHUB_REPO=asu_secure_superadmin \
npm run release-notes -- --from v1.0.0 --to v1.1.0 --output RELEASE_NOTES.md
```

### Environment Variables

- `GITHUB_TOKEN` - Personal access token with repo permissions
- `GITHUB_OWNER` - Repository owner (e.g., `asuwebplatforms`)
- `GITHUB_REPO` - Repository name (e.g., `asu_secure_superadmin`)

### Options

- `--from <tag>` - Starting tag (required)
- `--to <tag>` - Ending tag (required)
- `--output <file>` - Output file path (optional, prints to stdout if not specified)

## Configuration

Both solutions use `.github/release.yml` for categorization. Your current configuration:

```yaml
changelog:
  categories:
    - title: Webspark changes
      labels:
        - webspark
    - title: Feature Development
      labels:
        - feature
    - title: Bug Fixes
      labels:
        - bug fix
    # ... more categories
  exclude:
    labels:
      - ignore-for-release
```

### Key Features

✅ **Multi-label support** - Items appear in all matching categories  
✅ **Label exclusion** - Skip PRs with certain labels  
✅ **Customizable categories** - Add/remove categories in `release.yml`  
✅ **GitHub API integration** - Fetches real PR data  
✅ **Flexible output** - Both automated and manual approaches  

## Label Best Practices

To maximize the multi-label feature:

1. **Always apply the category label** (`webspark`, `feature`, `bug fix`, etc.)
2. **Add secondary labels as needed** (e.g., `a11y`, `trusted-partner`)
3. **Skip with exclude labels** (e.g., `ignore-for-release` for internal changes)

### Example PR Labels

| PR | Labels | Appears In |
|----|--------|-----------|
| Webspark feature | `webspark`, `feature` | Webspark changes, Feature Development |
| Webspark bugfix | `webspark`, `bug fix` | Webspark changes, Bug Fixes |
| Accessibility feature | `a11y`, `feature` | Feature Development, Accessibility Changes |
| Partner change | `trusted-partner` | Trusted Partner changes |
| Regular feature | `feature` | Feature Development |

## Troubleshooting

### GitHub Action Not Running
- Verify release was published (not saved as draft)
- Check repository settings allow Actions to update content
- Review workflow logs in the Actions tab

### Script Returns No PRs
- Verify tags exist: `git tag`
- Check GITHUB_TOKEN has repo access
- Ensure PRs are marked as merged

### Incorrect Categorization
- Verify PR labels match exactly with `release.yml` labels
- Check for typos in label names
- Ensure label is applied to the PR before merging

## Development

To modify the scripts:

1. **GitHub Action**: Edit `.github/workflows/generate-release-notes.yml`
2. **Local Script**: Edit `scripts/generate-release-notes.js`
3. **Configuration**: Edit `.github/release.yml`

Both use the same logic for categorization, so changes should be synchronized.

