#!/usr/bin/env bash
set -e

if [ -d "~/node" ] 
then
    cd ~/node
    sudo pm2 stop www || true
    sudo pm2 delete www
    sudo pm2 save --force
    sudo pm2 cleardump
    cd ~
    rm -rf ~/node
fi

cd ~/node
npm install

# setup NODE_ENV
if [ ! -z "$DEPLOYMENT_GROUP_NAME" ]; then
    export NODE_ENV=$DEPLOYMENT_GROUP_NAME

    hasEnv=`grep "export NODE_ENV" ~/.profile | cat`
    if [ -z "$hasEnv" ]; then
        echo "export NODE_ENV=$DEPLOYMENT_GROUP_NAME" >> ~/.profile
    else
        sed -i "/export NODE_ENV=\b/c\export NODE_ENV=$DEPLOYMENT_GROUP_NAME" ~/.profile
    fi
fi

# add node to startup
hasRc=`grep "su -l $USER" /etc/rc.local | cat`
if [ -z "$hasRc" ]; then
    sudo sh -c "echo 'su -l $USER -c \"cd ~/node;sh ./run.sh\"' >> /etc/rc.local"
fi