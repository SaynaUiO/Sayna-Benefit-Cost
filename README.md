# Benefit Estimation and Goal Management

This project contains a Forge app written in Typescript. It is a project bringing Benefit/Cost to Jira.

See [developer.atlassian.com/platform/forge/](https://developer.atlassian.com/platform/forge) for documentation and tutorials explaining Forge.

## Requirements

See [Set up Forge](https://developer.atlassian.com/platform/forge/set-up-forge/) for instructions to get set up.

## Quick start
- Install dependecies (inside root directory)
```
npm install
```
- Install dependencies (inside of the `static/benefit-evaluation` directory)::
```
npm install
```

- Modify your app by editing the files in `static/benefit-evaluation/src/`.

- Build your app (inside of the `static/benefit-evaluation` directory):
```
npm run build
```

- Deploy your app by running, uses the output from ``npm run build`` to upload the app:
```
forge deploy
```

- Install your app in an Atlassian site by running:
```
forge install
```

- Develop your app by running `forge tunnel` to proxy invocations locally, requires docker to be running, uses the ``npm start`` to serve the app:
```
forge tunnel
```

### Notes
- Use the `forge deploy` command when you want to persist code changes.
- Use the `forge install` command when you want to install the app on a new site.
- Use the `forge tunnel` command when you want to develop your app locally.
- Once the app is installed on a site, the site picks up the new app changes you deploy without needing to rerun the install command.

### Get Going
- Run these commands from the root folder
```
npm install
cd static/benefit-evaluation
npm install
cd ../..
forge tunnel & (cd static/benefit-evaluation && npm start)
```