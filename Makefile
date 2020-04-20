export APP=mopidy-apollo
export APP_PATH := $(shell pwd)
export APP_VERSION	:= $(shell git describe --tags --always)

export DOCKER_USERNAME=cristianpb

export HOST_MUSIC_DIRECTORY=~/Musique
export HOST_SNAPCAST_TEMP=/tmp/snapcast-mopidy

up:
	docker-compose up --build

build:
	docker-compose build

build-python:
	sed -i -E "s/version = (.*)/version = ${APP_VERSION}/"  setup.cfg;
	docker run --rm \
		-v ${APP_PATH}/__sapper__/export/apollo:/${APP}/mopidy_apollo/static \
		-v ${APP_PATH}/mopidy_apollo/mopidy.conf:/root/.config/mopidy/mopidy.conf \
		-v ${HOST_MUSIC_DIRECTORY}:/var/lib/mopidy/media \
		-v ${HOST_SNAPCAST_TEMP}:/tmp \
		-v ${APP_PATH}/dist:/${APP}/dist \
		-p 6680:6680 \
		${DOCKER_USERNAME}/${APP}:${APP_VERSION} \
		sed -i -E "s/version = (.*)/version = ${APP_VERSION}/"  setup.cfg; \
		python3 setup.py sdist bdist_wheel
