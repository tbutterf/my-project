#!/usr/bin/env node

/**
 * Multi-Label Release Notes Generator
 *
 * This script generates release notes from GitHub pull requests,
 * properly handling items that have multiple labels by including
 * them in each matching category.
 *
 * Usage:
 *   node scripts/generate-release-notes.js --from <tag> --to <tag> [--output <file>]
 *
 * Environment Variables:
 *   GITHUB_TOKEN - GitHub API token (required)
 *   GITHUB_OWNER - Repository owner (required)
 *   GITHUB_REPO - Repository name (required)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const yaml = require('yaml');

// Configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;

if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
  console.error('Error: Missing required environment variables:');
  console.error('  GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO');
  process.exit(1);
}

// Parse command line arguments
const args = process.argv.slice(2);
let fromTag = null;
let toTag = null;
let outputFile = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--from') {
    fromTag = args[i + 1];
    i++;
  } else if (args[i] === '--to') {
    toTag = args[i + 1];
    i++;
  } else if (args[i] === '--output') {
    outputFile = args[i + 1];
    i++;
  }
}

if (!fromTag || !toTag) {
  console.error('Error: --from and --to tags are required');
  process.exit(1);
}

/**
 * Make GitHub API request
 */
function githubRequest(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: path,
      method: method,
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Release-Notes-Generator',
      },
    };

    https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`GitHub API error ${res.statusCode}: ${data}`));
        } else {
          resolve(JSON.parse(data));
        }
      });
    }).on('error', reject).end();
  });
}

/**
 * Get merged pull requests between two tags
 */
async function getMergedPRs(fromTag, toTag) {
  // Get compare data
  const compareUrl = `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/compare/${fromTag}...${toTag}`;
  const compareData = await githubRequest(compareUrl);

  if (!compareData.commits) {
    console.warn('No commits found between tags');
    return [];
  }

  // Extract PR numbers from commit messages and associated PRs
  const prNumbers = new Set();
  const commitShas = new Set();

  compareData.commits.forEach(commit => {
    commitShas.add(commit.sha);

    // Try to find PR references in commit message
    const prMatch = commit.message.match(/#(\d+)/);
    if (prMatch) {
      prNumbers.add(parseInt(prMatch[1]));
    }
  });

  // Get pull requests that have commits in this range
  const searchUrl = `/search/issues?q=repo:${GITHUB_OWNER}/${GITHUB_REPO}+is:merged+base:${fromTag}+merged:${fromTag}..${toTag}&per_page=100`;
  const searchData = await githubRequest(searchUrl);

  const prs = [];
  for (const item of searchData.items) {
    if (item.pull_request) {
      // Get full PR data
      const prUrl = `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/pulls/${item.number}`;
      const prData = await githubRequest(prUrl);

      // Only include if merged
      if (prData.merged_at) {
        prs.push(prData);
      }
    }
  }

  return prs.sort((a, b) => new Date(b.merged_at) - new Date(a.merged_at));
}

/**
 * Generate release notes from PRs
 */
function generateReleaseNotes(prs, releaseConfig) {
  const categories = releaseConfig.changelog.categories;
  const excludeLabels = releaseConfig.changelog.exclude.labels || [];

  const categorizedPRs = {};

  // Initialize categories
  categories.forEach(cat => {
    categorizedPRs[cat.title] = [];
  });

  // Process each PR
  prs.forEach(pr => {
    const prLabels = pr.labels.map(l => l.name);

    // Skip if in exclude list
    if (prLabels.some(l => excludeLabels.includes(l))) {
      return;
    }

    // Find all matching categories for this PR
    const matchingCategories = [];
    categories.forEach(cat => {
      const hasMatchingLabel = cat.labels.some(catLabel =>
        prLabels.includes(catLabel)
      );
      if (hasMatchingLabel) {
        matchingCategories.push(cat.title);
      }
    });

    // If no matching categories, skip or add to uncategorized
    if (matchingCategories.length === 0) {
      console.warn(`PR #${pr.number} ("${pr.title}") has no matching category labels`);
      return;
    }

    // Add PR to all matching categories
    matchingCategories.forEach(catTitle => {
      categorizedPRs[catTitle].push({
        number: pr.number,
        title: pr.title,
        user: pr.user.login,
        url: pr.html_url,
        labels: prLabels,
      });
    });
  });

  // Build release notes content
  let releaseNotes = '';
  categories.forEach(cat => {
    const prsInCategory = categorizedPRs[cat.title];
    if (prsInCategory && prsInCategory.length > 0) {
      releaseNotes += `## ${cat.title}\n\n`;

      // Remove duplicates while preserving order
      const seen = new Set();
      const uniquePRs = [];
      prsInCategory.forEach(pr => {
        if (!seen.has(pr.number)) {
          seen.add(pr.number);
          uniquePRs.push(pr);
        }
      });

      uniquePRs.forEach(pr => {
        const labelList = pr.labels.length > 0 ? ` (${pr.labels.join(', ')})` : '';
        releaseNotes += `- [#${pr.number}](${pr.url}): ${pr.title} (@${pr.user})${labelList}\n`;
      });

      releaseNotes += '\n';
    }
  });

  return releaseNotes.trim();
}

/**
 * Main function
 */
async function main() {
  try {
    console.log(`Generating release notes from ${fromTag} to ${toTag}...`);

    // Load release.yml configuration
    const configPath = path.join(process.cwd(), '.github', 'release.yml');
    if (!fs.existsSync(configPath)) {
      throw new Error(`.github/release.yml not found at ${configPath}`);
    }
    const releaseConfig = yaml.parse(fs.readFileSync(configPath, 'utf8'));

    // Get merged PRs
    console.log('Fetching merged pull requests from GitHub...');
    const prs = await getMergedPRs(fromTag, toTag);
    console.log(`Found ${prs.length} merged pull requests`);

    if (prs.length === 0) {
      console.warn('No pull requests found between tags');
      process.exit(0);
    }

    // Generate release notes
    const releaseNotes = generateReleaseNotes(prs, releaseConfig);

    // Output
    if (outputFile) {
      fs.writeFileSync(outputFile, releaseNotes);
      console.log(`\nRelease notes written to ${outputFile}`);
    } else {
      console.log('\nGenerated Release Notes:\n');
      console.log(releaseNotes);
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();

