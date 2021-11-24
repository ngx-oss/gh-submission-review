const core = require('@actions/core');
const github = require('@actions/github');

const review = async () => {
    const url = core.getInput('url');
    const token = core.getInput('token');
    const octokit = github.getOctokit(token);

    const [owner, repo] = url.replace('https://github.com/', '').split('/');

    const {data: metrics} = await octokit.rest.repos.getCommunityProfileMetrics({
        owner,
        repo,
    });

    if (!metrics) {
        throw new Error('Repository not found');
    }

    if (!metrics.files.license) {
        await octokit.rest.issues.createComment({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: github.context.issue.number,
            body: 'This project is missing a license'
        });
    }
}

try {
    review();
} catch (error) {
    core.setFailed(error.message);
}
