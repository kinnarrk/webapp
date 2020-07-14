var express = require('express');
var router = express.Router();

const db = require("../models");
const User = db.users;
const Op = db.Sequelize.Op;
const { QueryTypes } = require('sequelize');

var util = require('../lib/utils');

var logger = require('../config/winston');

var StatsD = require('node-statsd'),
      client = new StatsD();


router.use((req, res, next) => {
    const start = process.hrtime()
    res.on('finish', () => {            
        const durationInMilliseconds = util.getDurationInMilliseconds(start);
        var metric_name = req.originalUrl.replace(/\/\d+/g, "");    //remove query parameter
        metric_name = "url" + metric_name.replace(/[|&;$%@"<>()+,\/]/g, "-");
        client.timing(metric_name, durationInMilliseconds);
        logger.info(`${req.method} ${req.originalUrl} ${metric_name} [FINISHED] ${durationInMilliseconds.toLocaleString()} ms`);
    })
    next()
})

router.get('/', (req, res) => {
    // res.setHeader('Content-Type', 'application/json');
    db.sequelize.query("SELECT 'MySQL up and running' as resp", { type: QueryTypes.SELECT })
        .then(function(healthcheck){
            mysql_healthcheck = healthcheck;
            // res.end(JSON.stringify({ HealthCheckStatus: 1, MySQLHealthStatus: healthcheck}));
            res.json({"HealthCheckStatus": "1", "MySQLHealthStatus": `${healthcheck[0].resp}`});
        })
        .catch(err => {
            // res.end(JSON.stringify({ HealthCheckStatus: 1, MySQLHealthStatus: "MySQL not running" }));
            res.json({"HealthCheckStatus": "1", "MySQLHealthStatus": "MySQL not running"});
        });
    
    // logger.info(`Requested ${req.method} ${req.originalUrl}`, {tags: 'http', additionalInfo: {body: req.body, headers: req.headers }});
});

router.use(function (err, req, res, next) {
    if (err) {
        logger.error("Error occured in healthcheck: ", err);
        // console.log('Error', err);
    }
});

module.exports = router;
