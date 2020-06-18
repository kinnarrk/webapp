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