#!/usr/bin/sh

docker pull matterlabs/zksolc:latest
id=$(docker create matterlabs/zksolc:latest)
docker cp $id:/usr/local/bin/zksolc .
docker rm -v $id