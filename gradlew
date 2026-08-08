#!/usr/bin/env sh
# Mandela Matrix OS Canonical Gradle Wrapper Script
APP_BASE_NAME=$(basename "$0")
DIRNAME=$(dirname "$0")
if [ -z "$DIRNAME" ]; then DIRNAME="." ; fi
exec "$DIRNAME/gradle/wrapper/gradle-wrapper.jar" "$@" 2>/dev/null || gradle "$@"
