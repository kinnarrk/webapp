#!/usr/bin/env bash
set -e

# if [ -d "~/node" ] 
# then
    # this is a workaround
    # if ls /opt/codedeploy-agent/deployment-root/deployment-instructions/*cleanup 1> /dev/null 2>&1;
    # then
    #     sudo rm -f /opt/codedeploy-agent/deployment-root/deployment-instructions/*cleanup
    # fi
    
    # cd ~/node
    # pm2 stop www || true
    
    # npm prune
    # cd ~
    # rm -rf ~/node
# fi
# update instance
# sudo apt -y update

# install general libraries like Java or ImageMagick
# apt-get -y install default-jre ImageMagick

# install pm2 module globaly
npm list pm2 || npm install -g pm2
pm2 update
