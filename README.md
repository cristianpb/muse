# Muse <img src="https://cristianpb.github.io/muse/icon.png" align="right" width="200" />

![PyPI](https://img.shields.io/pypi/v/Mopidy-Muse) ![PyPI - Downloads](https://img.shields.io/pypi/dm/Mopidy-Muse?label=PyPi%20downloads) [![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fcristianpb%2Fmuse%2Fbadge%3Fref%3Dmaster&style=flat)](https://actions-badge.atrox.dev/cristianpb/muse/goto?ref=master) ![Docker Pulls](https://img.shields.io/docker/pulls/cristianpb/mopidy-muse)

A mopidy player with snapcast support

## Features

- Support for snapcast volume control
- Responsive design based in bulma framework
- Modify tracklists using drag and drop motions
- Create and modify playlists
- Reactive search for tracklists in different sources
- No user tracking (No Google Analytics)
- Created using state of the art web technologies:
  - Svelte framework for small package size
  - Svelte kit for multiple pages and server side rendering
  - Github Actions CI/CD workflow for build and publish

Checkout a detailled description at [this blog post](https://cristianpb.github.io/blog/mopidy-muse)

<p align="center">
  <img width="901" height="450" src="https://cristianpb.github.io/assets/img/mopidy-muse/main.png" alt="Mopidy-Muse homepage">
</p>

## Installation

### Python

Install by running:

```bash
python3 -m pip install Mopidy-Muse
```

Before starting Mopidy, you must add configuration for Mopidy-Muse to your Mopidy configuration file:

```conf
[muse]
enabled = true
# the following are optional values
mopidy_host = localhost
mopidy_port = 6680
mopidy_ssl = false
snapcast_host = localhost
snapcast_port = 1780
snapcast_ssl = false
```

### Docker installation

Using docker compose:

```bash
make start
```

Using docker run command:

```bash
make mopidy-docker
```

## Project resources

- [Source code](https://github.com/cristianpb/muse)
- [Issue tracker](https://github.com/cristianpb/muse/issues)
