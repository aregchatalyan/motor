#!/bin/bash

docker compose down --rmi all --remove-orphans
docker compose up --build
