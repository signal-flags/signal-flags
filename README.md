# signal-flags

The home repository for the open source signal flags project.

```bash
# Generate svg files
npm run build:svg
```

```bash
# Generated images.
signal-flag-images

# `signal-flags` node module.
signal-flags-js

# `signal-flags/signal-flags` Composer module for PHP.
signal-flags-php

# WordPress plugin.
signal-flags-wp

# Source for https://signal-flags.github.io.
signal-flags-website

# Deployment of https://signal-flags.github.io.
signal-flags.github.io
```
## Processes

## Build images in `signal-flags-images` repo.
This currently uses npm link to use whatever version of the `signal-flags`
module that is in `../signal-flags-js/dist`. Should refactor this so it does it
by directory path iff a `--dev` option is set, otherwise from a normal npm
install.

```bash
npm run build:images
```

## Releases

Release cycles for signal-flags repositories are merged from v2.

signal-flags-js
signal-flags-wp-plugin
signal-flag-images
signal-flags-php
signal-flags.github.io

signal-flags-website: becoming redundant.
signal-flags: replaces signal-flags-dev
