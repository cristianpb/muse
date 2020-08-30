"""Mopidy script to add extension """

import logging
import pathlib

import pkg_resources
import tornado.web

from mopidy import config, ext

__version__ = pkg_resources.get_distribution("Mopidy-Muse").version

logger = logging.getLogger(__name__)

class MuseRequestHandler(tornado.web.RequestHandler):

    def initialize(self, config):
        muse_config = dict(config["muse"])
        self.config = dict(
                mopidy = dict(
                    host = muse_config.get("mopidy_host"),
                    port = muse_config.get("mopidy_port"),
                    ssl = muse_config.get("mopidy_ssl")
                    ),
                snapcast = dict(
                    host = muse_config.get("snapcast_host"),
                    port = muse_config.get("snapcast_port"),
                    ssl = muse_config.get("snapcast_ssl")
                    )
                )

    def get(self):
        self.write(self.config)
        self.set_header('Content-Type', 'application/json')

def muse_factory(config, core):
    return [
            ('/config', MuseRequestHandler, {'config':config})
    ]

class Extension(ext.Extension):

    dist_name = "Mopidy-Muse"
    ext_name = "muse"
    version = __version__

    def get_default_config(self):
        return config.read(pathlib.Path(__file__).parent / "ext.conf")

    def get_config_schema(self):
        schema = super().get_config_schema()
        schema['mopidy_host'] = config.Hostname(optional=True)
        schema['mopidy_port'] = config.Port(optional=True)
        schema['mopidy_ssl'] = config.Boolean(optional=True)
        schema['snapcast_host'] = config.Hostname(optional=True)
        schema['snapcast_port'] = config.Port(optional=True)
        schema['snapcast_ssl'] = config.Boolean(optional=True)
        return schema

    def setup(self, registry):
        registry.add(
            "http:static",
            {
                "name": self.ext_name,
                "path": str(pathlib.Path(__file__).parent / "static"),
            },
        )
        registry.add('http:app', {
            'name': self.ext_name,
            'factory': muse_factory,
        })
