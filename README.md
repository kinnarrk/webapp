# webapp

This app is for practicing Git workflow and CI/CD

Technology stack:
- Node.js (v12.x)
- Express.js
- MySQL with Sequelize ORM
- Ejs (Templating engine - UI)
- Jest (Testing framework)
- Circle CI for CI/CD Pipeline
- Winston (Logging)
- Node-statsd (Statsd client)
- JMeter (Load testing)

## Installing node.js and npm

https://github.com/nodesource/distributions/blob/master/README.md#installation-instructions

### Debian and Ubuntu based distributions

#### Node.js v12.x:
```$xslt
# Using Ubuntu
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install -y nodejs

# Using Debian, as root
curl -sL https://deb.nodesource.com/setup_12.x | bash -
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

## Pre-requisites 
Before running the app in development environment, it is expected that MySQL server is installed and database mentioned in `DB` field of `db.config.js` is created

## Starting the app
Execute `npm start` from root of the repo

## Running test cases
This app uses [Jest](https://jestjs.io/en/) framework for executing unit and integration tests.
Command to run all the tests is `npm test`

### Credits
Theme used: [SB Admin 2](https://startbootstrap.com/themes/sb-admin-2/) Under [MIT](https://github.com/BlackrockDigital/startbootstrap-sb-admin-2/blob/master/LICENSE) license
