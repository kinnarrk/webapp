const aws = require('aws-sdk');
const bodyParser = require('body-parser');

var logger = require('../config/winston');

var util = require('./utils');
// const start = process.hrtime()
// const durationInMilliseconds = util.getDurationInMilliseconds(start);
// client.timing(`${req.originalUrl}`, durationInMilliseconds);

var profileName = 'dev';
var regionName = 'us-east-1';
var TopicArn = 'arn:aws:sns:us-east-1:079111615792:send-email-topic';
if (process.env.NODE_ENV == 'production') {
    profileName = process.env.IAMInstanceProfileName;
    // regionName = process.env.IAMInstanceProfileName;
    regionName = process.env.DEPLOYMENT_REGION;
    TopicArn = process.env.SNS_TOPIC_ARN
} else {
    console.info("Running Env: " + process.env.NODE_ENV);
    var credentials = new aws.SharedIniFileCredentials({ profile: profileName });
    aws.config.credentials = credentials;
}

aws.config.getCredentials(function (err) {
    if (err) console.log(err.stack);
    else {
        // console.log("Access key:", aws.config.credentials.accessKeyId);
    }
});
aws.config.update({ region: regionName });

// var sns = new AWS.SNS();

exports.sendSNSEmailNotification = function (email) {
    var params = {
        Message: email, /* required */
        TopicArn: TopicArn
    };

    var publishTextPromise = new aws.SNS({apiVersion: '2010-03-31'}).publish(params).promise();

    publishTextPromise.then(
        function(data) {
            console.log(`Message ${params.Message} send sent to the topic ${params.TopicArn}`);
            console.log("MessageID is " + data.MessageId);
        }).catch(
            function(err) {
            console.error(err, err.stack);
        });

    // sns.createPlatformEndpoint({
    //     PlatformApplicationArn: '{APPLICATION_ARN}',
    //     Token: '{DEVICE_TOKEN}'
    // }, function (err, data) {
    //     if (err) {
    //         console.log(err.stack);
    //         return;
    //     }

    //     var endpointArn = data.EndpointArn;

    //     var payload = {
    //         default: 'Hello World',
    //         APNS: {
    //             aps: {
    //                 alert: 'Hello World',
    //                 sound: 'default',
    //                 badge: 1
    //             }
    //         }
    //     };

    //     // first have to stringify the inner APNS object...
    //     payload.APNS = JSON.stringify(payload.APNS);
    //     // then have to stringify the entire message payload
    //     payload = JSON.stringify(payload);

    //     console.log('sending push');
    //     sns.publish({
    //         Message: payload,
    //         MessageStructure: 'json',
    //         TargetArn: endpointArn
    //     }, function (err, data) {
    //         if (err) {
    //             console.log(err.stack);
    //             return;
    //         }

    //         console.log('push sent');
    //         console.log(data);
    //     });
    // });
}