import express from 'express';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const repoUrl = process.env.GITHUB_REPO_URL;
    if (!repoUrl) {
      return res.status(400).json({ error: 'GITHUB_REPO_URL is not configured.' });
    }

    // Extract owner and repo from URL
    // e.g. https://github.com/user/repo
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      return res.status(400).json({ error: 'Invalid GITHUB_REPO_URL format.' });
    }

    const owner = match[1];
    const repo = match[2].replace('.git', '');

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases`);
    if (!response.ok) {
      if (response.status === 404) {
        return res.json({ releases: [] }); // No releases or repo not found
      }
      throw new Error(`GitHub API responded with status ${response.status}`);
    }

    const releases = await response.json();
    res.json({ releases });
  } catch (error) {
    console.error('Error fetching GitHub releases:', error);
    res.status(500).json({ error: 'Failed to fetch updates' });
  }
});

export default router;
