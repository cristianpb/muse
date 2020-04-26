export APP=mopidy-muse
export APP_PATH := $(shell pwd)
export APP_VERSION := $(shell git describe --tags --always --abbrev=0)
export APP_VERSION_CUT=$(subst v,,$(APP_VERSION))

export DOCKER_USERNAME=cristianpb

export HOST_MUSIC_DIRECTORY=${APP_PATH}/data/music
export HOST_PLAYLIST_DIRECTORY=${APP_PATH}/data/playlists
export HOST_SNAPCAST_TEMP=/tmp/snapcast-mopidy

up:
	docker-compose up --build

build-docker:
	docker-compose build

__sapper__/export/muse:
	npm run export

build-html: __sapper__/export/muse

build-python: build-html
	sed -i -E "s/version = (.*)/version = ${APP_VERSION_CUT}/"  setup.cfg;
	sed -i -E "s/version\": \"(.*)\"/version\": \"${APP_VERSION_CUT}\"/"  package.json;
	docker run --rm \
		-v ${APP_PATH}/__sapper__/export/muse:/${APP}/mopidy_muse/static \
		-v ${APP_PATH}/mopidy_muse/mopidy.conf:/root/.config/mopidy/mopidy.conf \
		-v ${HOST_MUSIC_DIRECTORY}:/var/lib/mopidy/media \
		-v ${HOST_PLAYLIST_DIRECTORY}:/var/lib/mopidy/playlists \
		-v ${HOST_SNAPCAST_TEMP}:/tmp \
		-v ${APP_PATH}/dist:/${APP}/dist \
		-p 6680:6680 \
		${DOCKER_USERNAME}/${APP}:${APP_VERSION} \
		python3 setup.py sdist bdist_wheel

mopidy-local-scan:
	docker exec -it ${APP} mopidy local scan

clean:
	rm -rf __sapper__/export dist
