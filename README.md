# Seattle Buildings Data Analysis

A simple project to demonstrate building and auto-deploying a static website to GitHub Pages using GitHub Actions.

View the [auto-generated page here](https://chenilim.github.io/seattleBuildings/).

The `publish-gh-pages.yml` workflow shows how to use github-pages-deploy-action to deploy to the gh-pages branch, which is used as the source of the public GitHub page.

Tips and tricks:

-   Add "PRESERVE: true" to the workflow yml options
-   Create an empty gh-pages branch and push before running the first action
-   Remember to switch back to main, and don't touch the gh-pages branch after that
-   The workflow will build then commit the contents of dist to the /docs folder on the gh-pages branch
-   Note that the docs folder doesn't appear in main
