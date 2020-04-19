import logging
import pathlib

import pkg_resources

from mopidy import config, ext

__version__ = pkg_resources.get_distribution("Mopidy-Apollo").version

class Extension(ext.Extension):

    dist_name = "Mopidy-Apollo"
    ext_name = "apollo"
    version = __version__

    def get_default_config(self):
        return config.read(pathlib.Path(__file__).parent / "ext.conf")

    def get_config_schema(self):
        schema = super().get_config_schema()
        return schema

    def setup(self, registry):
        # You will typically only implement one of the following things
        # in a single extension.
        registry.add(
            "http:static",
            {
                "name": self.ext_name,
                "path": str(pathlib.Path(__file__).parent / "static"),
            },
        )
