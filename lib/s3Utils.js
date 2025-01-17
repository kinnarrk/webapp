var aws_access_key = process.env.AWS_ACCESS_KEY
var aws_secret_key = process.env.AWS_SECRET_KEY
var aws_s3_bucket = process.env.AWS_S3_BUCKET

const fs = require('fs');
const aws = require('aws-sdk');
const bodyParser = require('body-parser');

var logger = require('../config/winston');

var StatsD = require('node-statsd'),
      client = new StatsD();

var util = require('./utils');
// const start = process.hrtime()
// const durationInMilliseconds = util.getDurationInMilliseconds(start);
// client.timing(`${req.originalUrl}`, durationInMilliseconds);

var profileName = 'dev';
var regionName = 'us-east-1';
if(process.env.NODE_ENV == 'production'){
    profileName = process.env.IAMInstanceProfileName;
    // regionName = process.env.IAMInstanceProfileName;
    aws_s3_bucket = process.env.S3BucketName;
    regionName = process.env.DEPLOYMENT_REGION;
} else {
    console.info("Running Env: " + process.env.NODE_ENV);
    aws_s3_bucket = "kinnarkansara-testing-s3-bucket";
    var credentials = new aws.SharedIniFileCredentials({profile: profileName});
    aws.config.credentials = credentials;
}

aws.config.getCredentials(function(err) {
    if (err) console.log(err.stack);
    else {
        // console.log("Access key:", aws.config.credentials.accessKeyId);
    }
});
aws.config.update({ region: regionName });
var s3 = new aws.S3();
const multer  = require('multer')
const multerS3 = require('multer-s3');

exports.upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: aws_s3_bucket,
        acl: 'public-read',
        // serverSideEncryption: 'AES256',
        key: function (req, file, cb) {
            const extension = file.originalname.split('.').pop();
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            // console.log(file);
            const start = process.hrtime();
            cb(null, uniqueSuffix+"."+extension);
            const durationInMilliseconds = util.getDurationInMilliseconds(start);
            client.timing('s3_upload_image', durationInMilliseconds);
            logger.info(`S3 object uploaded successfully in ${durationInMilliseconds.toLocaleString()} ms`, {tags: 'http', additionalInfo: {fileDetails: file }});
        }
    })
});

exports.getS3Object = function(bookImage){
    s3.getObject({
        Bucket: aws_s3_bucket,
        Key: bookImage.imageName,
        // SSECustomerAlgorithm: 'AES256' 
    }, function(err, data) {
        if(err){
            console.error("Error getting object:" + err);
        }
        console.log(data);
        return data;
        // $timeout(function(){
        //     $scope.s3url = "data:image/jpeg;base64," + encode(file.Body);
        // },1);
        // return "data:image/jpeg;base64," + encode(data.Body);
        // res.writeHead(200, {'Content-Type': bookImage.imageType});
        // res.write(data.Body, 'binary');
        // res.end(null, 'binary');
    });
}

exports.deleteS3Object = function(bookImage){
    const start = process.hrtime();
    s3.deleteObject({
        Bucket: aws_s3_bucket,
        Key: bookImage.imageName,
        // SSECustomerAlgorithm: 'AES256' 
    }, function(err, data) {
        if (err) logger.error(`Error deleting s3 data`, {tags: 'http', additionalInfo: {error: err}});  // error
        else {
            const durationInMilliseconds = util.getDurationInMilliseconds(start);
            client.timing('s3_delete_image', durationInMilliseconds);
            logger.info(`S3 object deleted successfully`, {tags: 'http', additionalInfo: {fileDetails: data }});                // deleted
        }
    });    
}
// function encode(data)
// {
//     var str = data.reduce(function(a,b){ return a+String.fromCharCode(b) },'');
//     return btoa(str).replace(/.{76}(?=.)/g,'$&\n');
// }

// async function getImage(fileName){
//     const data =  s3.getObject(
//       {
//           Bucket: aws_s3_bucket,
//           Key: fileName
//         }
      
//     ).promise();
//     return data;
// }

// getImage()
//     .then((img)=>{
//         let image="<img src='data:image/jpeg;base64," + encode(img.Body) + "'" + "/>";
//         let startHTML="<html><body></body>";
//         let endHTML="</body></html>";
//         let html=startHTML + image + endHTML;
//         res.send(html)
//     }).catch((e)=>{
//         res.send(e)
// });

// function encode(data){
//     let buf = Buffer.from(data);
//     let base64 = buf.toString('base64');
//     return base64
// }


exports.putObject = function(filePath) {
    const uploadFile = (filePath) => {
        // Read content from the file
        const fileContent = fs.readFileSync(filePath);
    
        var filename = fullPath.replace(/^.*[\\\/]/, '')
        
        // Setting up S3 upload parameters
        const params = {
            Bucket: aws_s3_bucket,
            Key: filename, // File name you want to save as in S3
            Body: fileContent
        };
    
        // Uploading files to the bucket
        s3.upload(params, function(err, data) {
            if (err) {
                console.error("s3 upload error: " + err);
                throw err;
            }
            console.log(`File uploaded successfully. ${data.Location}`);
            return data.Location;
        });
    };
    
}