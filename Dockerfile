##########################################################
FROM cristianpb/mopidy-base as muse
ARG app_path

# Base dir /app
WORKDIR /$app_path

COPY mopidy_muse/mopidy.conf /root/.config/mopidy.conf
COPY setup.py ./
COPY setup.cfg ./
COPY LICENSE ./
COPY MANIFEST.in ./
COPY README.md ./
COPY pyproject.toml ./
ADD ./mopidy_muse ./mopidy_muse

#VOLUME /${app_path}/mopidy_muse/static

RUN pip3 install --no-clean --no-use-pep517 -e .

EXPOSE 6680
CMD ["mopidy"]
