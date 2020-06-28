#!/usr/bin/env bash
set -e

# update instance
# sudo apt -y update

# install general libraries like Java or ImageMagick
# apt-get -y install default-jre ImageMagick

# install pm2 module globaly
npm list pm2 || npm install -g pm2
pm2 update

if [ -d "~/node" ] 
then
    cd ~/node
    pm2 stop www || true
    cd ~
    sudo rm -rf node
fi