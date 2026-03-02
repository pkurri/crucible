import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export async function getPullRequestFiles(
  owner: string,
  repo: string,
  pullNumber: number
) {
  const { data: files } = await octokit.pulls.listFiles({
    owner,
    repo,
    pull_number: pullNumber,
  });

  return files.map(file => ({
    path: file.filename,
    status: file.status,
    additions: file.additions,
    deletions: file.deletions,
    patch: file.patch,
    content: null as string | null,
  }));
}

export async function getFileContent(
  owner: string,
  repo: string,
  path: string,
  ref: string
) {
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref,
    });

    if ('content' in data) {
      return Buffer.from(data.content, 'base64').toString('utf-8');
    }
    return null;
  } catch (error) {
    console.error(`Error fetching ${path}:`, error);
    return null;
  }
}

export function getLanguageFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  
  const languageMap: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    py: 'python',
    go: 'go',
    rs: 'rust',
    java: 'java',
    rb: 'ruby',
    php: 'php',
    cs: 'csharp',
    cpp: 'cpp',
    c: 'c',
    swift: 'swift',
    kt: 'kotlin',
    scala: 'scala',
    html: 'html',
    css: 'css',
    scss: 'scss',
    sql: 'sql',
    md: 'markdown',
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    dockerfile: 'dockerfile',
  };

  return languageMap[ext] || 'text';
}
