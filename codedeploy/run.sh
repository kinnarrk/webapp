#!/usr/bin/env bash
if [ ! -z "$DEPLOYMENT_GROUP_NAME" ]; then
 export NODE_ENV=$DEPLOYMENT_GROUP_NAME
 export PORT=80
fi

cd ~/node
sudo pm2 start bin/www -n www -i 0