SHELL := /bin/bash

export APP=mopidy-muse
export APP_PATH := $(shell pwd)
export APP_VERSION := $(shell git describe --tags --always)
export APP_VERSION_CUT=$(subst v,,$(APP_VERSION))
export USE_TTY := $(shell test -t 1 && USE_TTY="-t")

export DOCKER_USERNAME=cristianpb

export HOST_MUSIC_DIRECTORY=${APP_PATH}/data/music
export HOST_PLAYLIST_DIRECTORY=${APP_PATH}/data/playlists
export HOST_SNAPCAST_TEMP=/tmp/snapcast-mopidy

export MOPIDY_HOST=localhost
export MOPIDY_PORT=6680

dummy		    := $(shell touch artifacts)
include ./artifacts

snapclient-start:
	docker-compose up -d snapclient

snapclient-stop:
	docker-compose stop snapclient

snapserver-start:
	docker-compose up -d snapserver

snapserver-stop:
	docker-compose stop snapserver

mopidy-start:
	docker-compose up --build -d mopidy
	@timeout=30 ; ret=1 ;\
		until [ "$$timeout" -le 0 -o "$$ret" -eq "0"  ] ; do\
			(docker exec -i ${USE_TTY} ${APP} curl -s --fail -X GET http://localhost:${MOPIDY_PORT}/muse/config > /dev/null) ;\
			ret=$$? ;\
			if [ "$$ret" -ne "0" ] ; then\
				echo -e "try still $$timeout seconds to start mopidy before tiemout" ;\
			fi ;\
			((timeout--)); sleep 1 ;\
		done ;\
	echo -e "mopidy started in $$((30 - timeout)) seconds"; exit $$ret

mopidy-dev:
	docker-compose up --build -d --force-recreate

mopidy-stop:
	docker-compose down --remove-orphan

build-docker-mopidy:
	docker build -f Dockerfile-base -t cristianpb/mopidy-base:${APP_VERSION_CUT}  --target base .

__sapper__/export/muse:
	npm --no-git-tag-version --allow-same-version version ${APP_VERSION}
	NODE_ENV=production npm run export

build-html: __sapper__/export/muse

dist:
	sudo mkdir -p ${APP_PATH}/dist ; sudo chmod g+rw ${APP_PATH}/dist/.; sudo chgrp 1000 ${APP_PATH}/dist/.;

build-python: dist build-html
	sed -i -E "s/version = (.*)/version = ${APP_VERSION_CUT}/"  setup.cfg;
	docker-compose run --rm mopidy python3 setup.py sdist bdist_wheel

mopidy-local-scan:
	docker exec -it ${APP} mopidy local scan

clean:
	rm -rf __sapper__/export dist

sapper-dev:
	npm run dev

start: mopidy-start snapserver-start snapclient-start
	@sleep 2 && docker-compose logs

stop: mopidy-stop snapserver-stop snapclient-stop
	@echo all components stopped

down: stop
