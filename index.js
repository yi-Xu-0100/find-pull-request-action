'use strict'

const core = require('@actions/core')
const { GitHub, context } = require('@actions/github')

const main = async () => {
  const token = core.getInput('github-token')
  const branch = core.getInput('branch')
  const base = core.getInput('base')
  const author = core.getInput('author')
  const state = core.getInput('state')
  const sort = core.getInput('sort')
  const direction = core.getInput('direction')
  const fail = core.getInput('ci-fail-if-not-found')

  const query = {
    ...context.repo,
    state
  }
  if (branch) {
    query.head =
      branch.indexOf(':') === -1 ? `${context.repo.owner}:${branch}` : branch
  }
  if (base) {
    query.base = base
  }
  if (sort) {
    query.sort = sort
  }
  if (direction) {
    query.direction = direction
  }

  const octokit = new GitHub(token)

  const res = await octokit.pulls.list(query)
  const pr = author
    ? res.data.length && res.data.filter(pr => pr.user.login === author)[0]
    : res.data.length && res.data[0]

  core.debug(`pr: ${JSON.stringify(pr, null, 2)}`)
  core.setOutput('number', pr ? pr.number : '')
  core.setOutput('head-sha', pr ? pr.head.sha : '')

  if(!pr && fail) {
    core.setOutput('pr-hit', false)
    throw new Error('No pull request found!')
  } else core.setOutput('pr-hit', true)
}

main().catch(err => core.setFailed(err.message))
