# Contribution to the bot template

First off! Thankyou for considering contributing, i am not the best at this and any help is appreciated!

## What i am looking for

- bug fixes 
- qol improvements to the project structure
- potential future documentation? (i really dont want to)
- new or better example commands or events that showcase usefulness

I want to keep this template minimal and opinionated, so im not looking to bundle in alot of dashboards, heavy dependencies or things like that. they belong in their own forks! (which i encouragfe.)

## Getting started

```bash
git clone https://github.com/dogbonewish/fluxer-bot-template.git
cd fluxer-bot-template
npm install
cp .env.example .env
# fill in your TOKEN, PREFIX, OWNER_ID
npm run dev
```

## Making changes

1. fork da repo
2. create a branch
3 make your changes
4. make sure typescript is happy
5. open a pr with a clear description of what you changed and why

## code style

- typescript strict mode, so no any unless you have a VERY good reason
- keep things readable
- match the existing file/folder strucutre
- comment your code if its doing something non-obvious, i want people to be able to learn with this

## reporting bugs

use the [bug report](.github/ISSUE_TEMPLATE/bug_report.md) issue template, the more detal the better. include your node version, what you expected to happen and what actually happened.

## suggesting features

Use the [feature request](.github/ISSUE_TEMPLATE/feature_request.md) template, keep in mind the minimal on purpose idealogy, if its a big addition i recommmend forking this and making your own project.

## license

its mit, if you contrib you agree that it will be under the MIT License.