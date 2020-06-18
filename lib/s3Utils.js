var aws_access_key = process.env.AWS_ACCESS_KEY
var aws_secret_key = process.env.AWS_SECRET_KEY
var aws_s3_bucket = process.env.AWS_S3_BUCKET

const fs = require('fs');
const aws = require('aws-sdk');
const bodyParser = require('body-parser');

var credentials = new aws.SharedIniFileCredentials({profile: 'dev'});
aws.config.credentials = credentials;
aws.config.update({ region: 'us-east-1' });
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
            console.log(file);
            cb(null, uniqueSuffix+"."+extension);
        }
    })
});

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