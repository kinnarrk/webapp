#!/usr/bin/env bash
cd ~/node
sudo pm2 stop www || true

sudo rm -f /opt/codedeploy-agent/deployment-root/deployment-instructions/*cleanup