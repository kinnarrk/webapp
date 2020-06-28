#!/usr/bin/env bash
set -e

if [ -d "~/node" ] 
then
    # this is a workaround
    if [ -f "/opt/codedeploy-agent/deployment-root/deployment-instructions/*.cleanup"]
    then
        rm -f /opt/codedeploy-agent/deployment-root/deployment-instructions/*.cleanup
    fi
    
    cd ~/node
    pm2 stop www || true
    # sudo pm2 delete www
    # sudo pm2 save --force
    # sudo pm2 cleardump
    # pm2 kill
    # npm remove pm2 -g
    npm prune
    cd ~
    rm -rf ~/node
fi
# update instance
# sudo apt -y update

# install general libraries like Java or ImageMagick
# apt-get -y install default-jre ImageMagick

# install pm2 module globaly
npm list pm2 || npm install -g pm2
pm2 update
