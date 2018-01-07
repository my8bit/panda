#!/bin/bash
CARTRIGE="panda.tic"
MODE="-code-watch"
if [ $# -eq 0 ]; then
  CODE="panda.min.js"
else
  CODE="$1"
fi

if uname | grep -iq darwin; then
  CMD="/Applications/tic80.app/Contents/MacOS/tic80"
else
  CMD="../tic.exe"
fi

$CMD $CARTRIGE $MODE $CODE
