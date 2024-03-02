"""Mopidy script to add extension """

import logging
import pathlib

import pkg_resources
import tornado.web

from mopidy import config, ext

__version__ = pkg_resources.get_distribution("Mopidy-Muse").version

logger = logging.getLogger(__name__)

class SPARouterHandler(tornado.web.StaticFileHandler):
    def initialize(self, path):
        self.path = str(path)
        self.absolute_path = path
        self.dirname = path.parent
        self.filename = path.name

        super().initialize(self.dirname)

    def get(self, path=None, include_body=True):
        return super().get(self.path, include_body)

class ConfigRouterHandler(tornado.web.RequestHandler):

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
    path = pathlib.Path(__file__).parent / "static"

    return [
            ('/config', ConfigRouterHandler, {'config':config}),
            (r"/((.*)(?:css|js|json|map|svg|png|jpg|ico)$)", tornado.web.StaticFileHandler, {"path": path}),
            (r"/(.*)", SPARouterHandler, {"path": path / "index.html"})
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
        registry.add('http:app', {
            'name': self.ext_name,
            'factory': muse_factory,
        })
