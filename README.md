# webapp

This app is meant for pracricing Git workflow and CI/CD

## Installing node.js and npm

https://github.com/nodesource/distributions/blob/master/README.md#installation-instructions

### Debian and Ubuntu based distributions

#### Node.js v12.x:
```$xslt
# Using Ubuntu
curl -sL https://deb.nodesource.com/setup_13.x | sudo -E bash -
sudo apt-get install -y nodejs

# Using Debian, as root
curl -sL https://deb.nodesource.com/setup_13.x | bash -
apt-get install -y nodejs
```
***Optional***: install build tools

To compile and install native addons from npm you may also need to install build tools:
```$xslt
# use `sudo` on Ubuntu or run this as root on debian
apt-get install -y build-essential
```

### Enterprise Linux based distributions

#### NodeJS 12.x
```$xslt
# As root
curl -sL https://rpm.nodesource.com/setup_12.x | bash -

# No root privileges 
curl -sL https://rpm.nodesource.com/setup_12.x | sudo bash -
```
***Optional***: install build tools

To compile and install native addons from npm you may also need to install build tools:
```$xslt
yum install gcc-c++ make
# or: yum groupinstall 'Development Tools'
```

## Installing dependencies from `package.json`
Execute `npm install` from root of the repo

## Starting the app
Execute `npm start` from root of the repo
