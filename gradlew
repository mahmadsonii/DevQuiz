#!/usr/bin/env sh
GRADLE_OPTS="${GRADLE_OPTS:-"-Dfile.encoding=UTF-8"}"
exec gradle "$@"
