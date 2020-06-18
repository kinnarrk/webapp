var aws_access_key = process.env.AWS_ACCESS_KEY
var aws_secret_key = process.env.AWS_SECRET_KEY
var aws_s3_bucket = process.env.AWS_S3_BUCKET

const fs = require('fs');
const AWS = require('aws-sdk');

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
                throw err;
            }
            console.log(`File uploaded successfully. ${data.Location}`);
            return data.Location;
        });
    };
    
}