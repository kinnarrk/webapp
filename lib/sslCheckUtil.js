const db = require("../models");
const Op = db.Sequelize.Op;
const { QueryTypes } = require('sequelize');
var logger = require('../config/winston');

exports.rdsSSLCheck = function () {
    // Check for ssl and log results
    db.sequelize.query("SHOW STATUS LIKE 'Ssl_%'", {
        type: QueryTypes.SELECT
    }).then((result) => {
        // console.log(result[0].Value);
        if(result == undefined || result == null || result.length == 0){
            logger.info(`RDS DB SSL Cipher check info: SSL data not available`, {tags: 'http', additionalInfo: {result: JSON.parse(JSON.stringify(result))}});
        } else {     
            logger.info(`RDS DB SSL Cipher check info: ${result[0].Value}`, {tags: 'http', additionalInfo: {result: JSON.parse(JSON.stringify(result))}});
        }
    }).catch(err => {
        logger.error(`Error in RDS DB SSL Cipher check: `, {tags: 'http', additionalInfo: {error: err}});
    });
}