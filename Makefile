export APP=mopidy-apollo
export APP_VERSION=0.0.1
#export APP_VERSION	:= $(shell git describe --tags --always )

export DOCKER_USERNAME=cristianpb

export HOST_MUSIC_DIRECTORY=~/Musique
export HOST_SNAPCAST_TEMP=/tmp/snapcast-mopidy

up:
	docker-compose up --build

build:
	docker-compose build
