##########################################################
FROM alpine as base

RUN apk update \
    && apk upgrade \
    && apk add --no-cache \
            gstreamer \
            mopidy \
            py-pip \
            alpine-sdk \
            python3-dev\
            dumb-init \
            curl

RUN pip3 install --upgrade --break-system-packages pip \
    && pip3 install --break-system-packages --no-cache-dir Mopidy-TuneIn Mopidy-Local Mopidy-Podcast Mopidy-Podcast \
    && rm -rf ~/.cache/pip

##########################################################
FROM base as muse
ARG app_path

# Base dir /app
WORKDIR $app_path

COPY mopidy_muse/mopidy.conf /root/.config/mopidy.conf
COPY LICENSE ./
COPY MANIFEST.in ./
COPY README.md ./
COPY pyproject.toml ./
ADD ./mopidy_muse ./mopidy_muse

#VOLUME ${app_path}/mopidy_muse/static

RUN pip3 install --break-system-packages -e .

EXPOSE 6680
CMD ["mopidy"]

##########################################################
FROM base as prod
ARG app_path

# Base dir /app
WORKDIR $app_path

COPY mopidy_muse/mopidy.conf /root/.config/mopidy.conf
COPY LICENSE ./
COPY MANIFEST.in ./
COPY README.md ./
COPY pyproject.toml ./
ADD ./mopidy_muse ./mopidy_muse
ADD ./build ./mopidy_muse/static

RUN pip install --break-system-packages -e .

EXPOSE 6680
CMD ["mopidy"]
