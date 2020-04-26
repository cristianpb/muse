# Apollo <img src="https://cristianpb.github.io/apollo/icon.png" align="right" width="200" />

![PyPI](https://img.shields.io/pypi/v/Mopidy-Apollo) ![PyPI - Downloads](https://img.shields.io/pypi/dm/Mopidy-Apollo?label=PyPi%20downloads) [![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fcristianpb%2Fapollo%2Fbadge%3Fref%3Dmaster&style=flat)](https://actions-badge.atrox.dev/cristianpb/apollo/goto?ref=master)

A mopidy player with snapcast support

## Features

* Support for snapcast volume control
* Responsive design based in bulma framework
* Modify tracklists using drag and drop motions
* Create and modify playlists
* Reactive search for tracklists in different sources
* No user tracking (No Google Analytics)
* Created using state of the art web technologies:
  * Svelte framework for small package size
  * Sapper for multiple pages and server side rendering
  * Github Actions CI/CD workflow for build and publish

Checkout a detailled description at [this blog post](https://cristianpb.github.io/blog/mopidy-apollo)

<p align="center">
  <img width="901" height="450" src="https://cristianpb.github.io/assets/img/mopidy-apollo/main.png" alt="Mopidy-Apollo homepage">
</p>

## Installation

Install by running:

```bash
python3 -m pip install Mopidy-Apollo
```

Before starting Mopidy, you must add configuration for Mopidy-Apollo to your Mopidy configuration file:

```conf
[apollo]
enabled = true
```

## Project resources

* [Source code](https://github.com/cristianpb/apollo)
* [Issue tracker](https://github.com/cristianpb/apollo/issues)
