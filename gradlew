#!/usr/bin/env sh
# Mandela Matrix OS Canonical Gradle Wrapper Script
DIRNAME=$(dirname "$0")
if [ -z "$DIRNAME" ]; then DIRNAME="." ; fi

WRAPPER_JAR="$DIRNAME/gradle/wrapper/gradle-wrapper.jar"

if [ -f "$WRAPPER_JAR" ]; then
    exec java -classpath "$WRAPPER_JAR" org.gradle.wrapper.GradleWrapperMain "$@"
elif command -v gradle >/dev/null 2>&1; then
    exec gradle "$@"
else
    echo "Error: Neither Gradle wrapper jar nor gradle command found." >&2
    exit 1
fi
