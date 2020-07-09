#!/usr/bin/env bash
if [ ! -z "$DEPLOYMENT_GROUP_NAME" ]; then
 export NODE_ENV=$DEPLOYMENT_GROUP_NAME
fi

# restart cloudwatch
cd ~/node
sudo systemctl stop amazon-cloudwatch-agent
sudo cp -f amazon-cloudwatch-agent.json /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
sudo systemctl start amazon-cloudwatch-agent

cd ~/node
pm2 start bin/www -n www -i 0

# making pm2 to run at startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
# sleep 60