#!/bin/bash

echo "test"

if [ ! -d "node_modules" ]
then
    # Install dependencies and create a file indicating successful installation
    npm install && touch node_modules/.all-deps-installed
fi

# Wait until dependencies have been installed by the
# default API
while [ ! -f node_modules/.all-deps-installed ]
do
    echo "[1337BOT] Waiting for dependencies to be installed..."
    sleep 5
done

exec npm run dev