##########################################################
FROM multiarch/ubuntu-debootstrap:amd64-focal-slim as base
RUN  apt-get update
RUN  apt-get install -y software-properties-common curl
RUN  apt-add-repository universe
RUN  curl -s https://apt.mopidy.com/mopidy.gpg | apt-key add -
RUN  curl -s -o /etc/apt/sources.list.d/mopidy.list https://apt.mopidy.com/buster.list
RUN  apt-get update --fix-missing
RUN  apt-get install -y \
         mopidy \
         python3-pip \
         gstreamer1.0-plugins-good \
         gstreamer1.0-plugins-bad \
         gstreamer1.0-plugins-ugly \
         gstreamer1.0-tools && \
         rm -rf /var/lib/apt/lists/* && \
         apt-get purge --auto-remove && \
         apt-get clean
RUN  pip3 install --no-cache-dir Mopidy-TuneIn Mopidy-Local

##########################################################
#FROM base as muse
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
