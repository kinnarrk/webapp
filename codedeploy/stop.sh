#!/usr/bin/env bash
cd ~/node
sudo pm2 stop www || true

cd ~
rm -rf ~/node
sudo rm -f /opt/codedeploy-agent/deployment-root/deployment-instructions/*cleanup
