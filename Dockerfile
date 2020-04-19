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
         gstreamer1.0-tools
RUN  pip3 install Mopidy-TuneIn Mopidy-Local

##########################################################
FROM base as apollo
ARG app_path

# Base dir /app
WORKDIR /$app_path

COPY mopidy_apollo/mopidy.conf /root/.config/mopidy.conf
COPY setup.py ./
COPY setup.cfg ./
COPY LICENSE ./
COPY MANIFEST.in ./
COPY README.md ./
COPY pyproject.toml ./
ADD ./mopidy_apollo ./mopidy_apollo
RUN pip3 install -e .

EXPOSE 6680
CMD ["mopidy"]
