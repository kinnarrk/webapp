var express = require('express');
var router = express.Router();

const passport = require('passport');

const users = require("../controllers/users.controller.js");
const db = require("../models");
const Book = db.books;
const Author = db.authors;
const BookAuthor = db.bookAuthors;
const BookImage = db.bookImages;
const User = db.users;
const Op = db.Sequelize.Op;
const { QueryTypes } = require('sequelize');

const fs = require('fs');
const AWS = require('aws-sdk');

const upload1 = require("../lib/upload");
var multer  = require('multer')

var s3utils = require('../lib/s3Utils');
var s3 = s3utils.s3

var logger = require('../config/winston');

var StatsD = require('node-statsd'),
      client = new StatsD();

var util = require('../lib/utils');
router.use((req, res, next) => {
    const start = process.hrtime()
    res.on('finish', () => {            
        const durationInMilliseconds = util.getDurationInMilliseconds(start);
        var metric_name = "url" + req.originalUrl.replace(/[|&;$%@"<>()+,\/]/g, "-");
        client.timing(metric_name, durationInMilliseconds);
    })        
    next()
})

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/tmp/uploads')
    },
    filename: function (req, file, cb) {
        const extension = file.originalname.split('.').pop();
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix+"."+extension)
    }
})
var upload = multer({ storage: storage })

// var upload = multer({ dest: '/tmp/uploads' })

const {
    ensureAuthenticated
} = require('../config/auth');

router.get('/', ensureAuthenticated, (req, res) => {
    client.increment('view_books');
    errors = [];
    const start = process.hrtime()
    db.sequelize.query("SELECT b.id id, b.isbn isbn, b.title title, date_format(b.publicationDate, '%m/%d/%Y') publicationDate, b.quantity quantity, " +
                                    " b.price price, group_concat(a.name) as author, ANY_VALUE(bi.imageName) as bookImage, ANY_VALUE(bi.imageType) as imageType, group_concat(DISTINCT(bi.imagePath)) as imagePath " +
                                    " FROM books b join bookAuthors ba on b.id = ba.bookId " +
                                    " join authors a on a.id = ba.authorId join users u on u.id = b.createdBy " +
                                    " left join bookImages bi on b.id = bi.bookId " +
                                    " where b.isDeleted = 0 and b.createdBy = " + req.user.id + " GROUP BY id ORDER BY b.price ASC", { type: QueryTypes.SELECT })
        .then(function(books){
            const durationInMilliseconds = util.getDurationInMilliseconds(start);
            client.timing('user_list_book_query', durationInMilliseconds);
            res.render('book', {books: books});
            req.session.flash = [];
        });

    logger.info(`Requested ${req.method} ${req.originalUrl}`, {tags: 'http', additionalInfo: {body: req.body, headers: req.headers }});

    // Book.findAll({ where: { isDeleted: false, createdBy: req.user.id },
    //     include: [
    //         {
    //             model: BookAuthor, as: 'bookId'
    //             include: [
    //                 {
    //                     model: Author
    //                 }
    //             ]
    //         }
    //     ],
    //     include: [
    //         {
    //             // model: User
    //             model: User
    //         }
    //     ],
    //     order: [['price', 'ASC']]
    // }).then(books => {
    //     res.render('book', {books: books});
    //     req.session.flash = [];
    //     const resObj = books.map(book => {
    //         //tidy up the user data
    //
    //     });
    // });
    // res.render('book');
    // req.session.flash = [];
});

router.get('/add', ensureAuthenticated, (req, res, next) => {
    let errors = [];
    let book = {
        isbn: "",
        title: "",
        publicationDate: "",
        quantity: "",
        price: ""
    };

    Author.findAll( {
    }).then(authors => {
        // console.info("in add 2....");
        if(authors) {
            // console.info("in add 3....");
            res.render('addBook', {authors: authors});
        } else {
            req.flash(
                'error_msg',
                'No authors found'
            );
            errors = [];
            res.redirect('/books/');
            logger.error(`Could not retrieve authors for add book page`);
        }
    });
    logger.info(`Requested ${req.method} ${req.originalUrl}`, {tags: 'http', additionalInfo: {body: req.body, headers: req.headers }});
});

router.get('/edit/:id', ensureAuthenticated, (req, res, next) => {
    let errors = [];
    let book = {
        isbn: "",
        title: "",
        publicationDate: "",
        quantity: "",
        price: ""
    };

    console.info("req.params.id" + req.params.id);
    Book.findOne({ where: { id: req.params.id , createdBy: req.user.id, isDeleted: false},
        attributes: [
            'id',
            'isbn',
            'title',
            [db.sequelize.fn('date_format', db.sequelize.col('publicationDate'), '%Y-%m-%d'), 'publicationDate'],
            'quantity',
            'price'
        ]
    })
        .then(book => {
        if(book){
            BookAuthor.findAll( { where: { bookId: book.id }
            }).then(bookAuthors => {
                // console.info("in add 2....");
                if(bookAuthors) {
                    // console.info("in add 3....");
                    Author.findAll( {
                    }).then(authors => {
                        // console.info("in add 22....");
                        if(authors) {
                            // console.info("in add 33...." + book);
                            BookImage.findAll( { where: { bookId: book.id }
                            }).then(bookImages => {
                                // console.info("in add 2....");
                                if(bookImages) {
                                    // console.info("in add 3....");
                                    res.render('addBook', {book: book, bookAuthors: bookAuthors, authors: authors, bookImages: bookImages});                                    
                                } else {
                                    // console.info("book not found 1");
                                    req.flash(
                                        'error_msg',
                                        'Book not found'
                                    );
                                    errors = [];
                                    res.redirect('/books');
                                    logger.error(`Book images not found`);
                                }
                            });                            
                        } else {
                            req.flash(
                                'error_msg',
                                'No authors found'
                            );
                            errors = [];
                            res.redirect('/books');
                            logger.error(`Unable to retrieve authors from database`);
                        }
                    });
                } else {
                    console.info("book not found 2");
                    req.flash(
                        'error_msg',
                        'Book not found'
                    );
                    errors = [];
                    res.redirect('/books');
                    logger.error(`Book author detail not found from database`);
                }
            });

        } else {
            // console.info("book not found 3");
            req.flash(
                'error_msg',
                'Book not found'
            );
            errors = [];
            res.redirect('/books');
            logger.error(`Required book not found from database`);
        }
    })
    .catch(err => {
        req.flash(
            'error_msg',
            'Error occurred in getting book details!'
        );
        // console.info('edit error', err);
        logger.error(`Data retrieval error in edit book`, {tags: 'http', additionalInfo: {error: err}});
        res.redirect('/books');
    });
    logger.info(`Requested ${req.method} ${req.originalUrl}`, {tags: 'http', additionalInfo: {body: req.body, headers: req.headers }});
});

router.post('/create', ensureAuthenticated, s3utils.upload.array('bookImages[]', 10), function(req, res, next) {
    // upload.array('bookImages', 10), 
    // const {
    //     isbn,
    //     title,
    //     publicationDate,
    //     quantity,
    //     price,
    //     authors
    // } = req.body;
    errors = [];
    // Validate request
    console.info("authors:" + req.body.authors);
    // console.info("files:" + req.files.bookImages);
    // console.info("authors:" + req.body['authors[]'])
    // console.info("files:" + req.files.length);
    if (!req.body.isbn || !req.body.title || !req.body.publicationDate || !req.body.quantity || !req.body.price || !req.body.authors) {
        errors.push({
            msg: 'Fields can not be empty!'
        });
    }
    console.info("Logged in user id: " + req.user.id);
    const book = {
        isbn: req.body.isbn,
        title: req.body.title,
        publicationDate: req.body.publicationDate,
        quantity: req.body.quantity,
        price: req.body.price,
        createdBy: req.user.id
    };
    const bookAuthors = req.body.authors;
    // const bookImages = req.files['bookImage[]'];

    if (errors.length > 0) {
        // console.info('errors.length', errors.length);
        Author.findAll( {
        }).then(authors => {
            // console.info("in add 2....");
            if(authors) {
                // console.info("in add 3....");
                res.render('addBook', {errors, book: book, authors: authors});
            } else {
                req.flash(
                    'error_msg',
                    'No authors found'
                );
                errors = [];
                res.redirect('/books/');
            }
        });
        req.session.flash = [];
        logger.error(`Required fields not submitted in create book`);
    } else {
        // console.info('else');
        const start = process.hrtime();
        Book.create(book)
            .then(data => {
                //create book author
                for (var i = 0; i < bookAuthors.length; i++) {
                    const bookauthors = {
                        bookId: data.id,
                        authorId: bookAuthors[i]
                    }
                    BookAuthor.create(bookauthors)
                        .then(data2 => {
                            if(!data2){
                                errors.push({
                                    msg: 'Error in adding book author'
                                });
                            }
                        });
                }
                // console.info("files:" + req.files['bookImages[]']);

                for (var i = 0; i < req.files.length; i++) {
                    // s3path = s3utils.putObject(req.files[i].path);
                    console.info("S3 path: " + req.files[i]);
                    const bookimages = {
                        bookId: data.id,
                        imagePath: req.files[i].location,    // full path to the uploaded file
                        imageBucket: req.files[i].bucket,
                        imageName: req.files[i].key,
                        imageType: req.files[i].contentType
                    }
                    // destination: dir and filename: file name at saved location
                    BookImage.create(bookimages)
                        .then(data2 => {
                            if(!data2){
                                errors.push({
                                    msg: 'Error in adding book image'
                                });
                            }
                        });
                }
                // try {

                    // upload1(req, res);
                    // console.log("req.file:" + req.file);
                    // console.log("req.files:" + req.files);
                    // console.log("req.files.bookImages:" + req.files.bookImages);
                    // console.log("req.body.bookImages:" + req.body.bookImages);
                
                    // if (req.files.length <= 0) {
                    //   return res.send(`You must select at least 1 file.`);
                    // }
                
                    // return res.send(`Files has been uploaded.`);
                // } catch (error) {
                //     console.log(error);
                
                //     if (error.code === "LIMIT_UNEXPECTED_FILE") {
                        // return res.send("Too many files to upload.");
                    // }
                    // return res.send(`Error when trying upload many files: ${error}`);
                // }
                // now file upload
                // for (var i = 0; i < bookImages.length; i++) {
                    // fs.readFile(req.files.bookImage.path, function (err, data) {
                    //     // ...
                    //     var newPath = __dirname + "/uploads/"+book.id+"_"+ new Date();
                    //     fs.writeFile(newPath, data, function (err) {
                    //         if(err){
                    //             console.error("File upload error:" + err)
                    //         }
                    //     });
                    // });
                // }

                // console.info("data:" + data)
                if(data) {
                    const durationInMilliseconds = util.getDurationInMilliseconds(start);
                    client.timing('user_add_book_query', durationInMilliseconds);
                    req.flash(
                        'success_msg',
                        'Book added successfully'
                    );
                    res.redirect('/books');
                    errors = [];
                } else {
                    req.flash(
                        'error_msg',
                        'Error in adding Book!'
                    );
                    res.redirect('/books');
                    errors = [];
                    logger.error(`Error in create book`);
                }
            })
            .catch(err => {
                req.flash(
                    'error_msg',
                    'Error occurred in adding book!'
                );
                // console.info('insert error', err);
                logger.error(`Error in inserting book`, {tags: 'http', additionalInfo: {error: err}});
                res.redirect('/books');
            });

    }
    logger.info(`Requested ${req.method} ${req.originalUrl}`, {tags: 'http', additionalInfo: {body: req.body, headers: req.headers }});
});

router.post('/update/:id', ensureAuthenticated, s3utils.upload.array('bookImages[]', 10), function(req, res, next) {
    const {
        isbn,
        title,
        publicationDate,
        quantity,
        price,
        authors
    } = req.body;
    errors = [];
    // console.info("req.params.id" + req.params.id);
    // Validate request
    // console.info("authors:" + req.body.authors)
    if (!req.body.isbn || !req.body.title || !req.body.publicationDate || !req.body.quantity || !req.body.price || !req.body.authors) {
        errors.push({
            msg: 'Fields can not be empty!'
        });
    }
    console.info("Logged in user id: " + req.user.id);
    const book = {
        id: req.params.id,
        isbn: req.body.isbn,
        title: req.body.title,
        publicationDate: req.body.publicationDate,
        quantity: req.body.quantity,
        price: req.body.price,
        updatedBy: req.user.id
    };
    // const bookAuthors = req.body['authors[]'];
    const bookAuthors = req.body.authors;

    if (errors.length > 0) {
        console.info('errors.length', errors.length);
        BookAuthor.findAll( { where: { bookId: book.id }
        }).then(bookAuthors => {
            console.info("in add 2....");
            if (bookAuthors) {
                Author.findAll({}).then(authors => {
                    console.info("in update 2....");
                    if (authors) {
                        console.info("in update 3....");
                        // res.render('addBook', {errors, book: book, bookAuthors: bookAuthors, authors: authors});
                        BookImage.findAll( { where: { bookId: book.id }
                        }).then(bookImages => {
                            // console.info("in add 2....");
                            if(bookImages) {
                                // console.info("in add 3....");
                                // res.render('addBook', {errors, book: book, bookAuthors: bookAuthors, authors: authors, bookImages: bookImages});                                    
                            } else {
                                // console.info("book not found 1");
                                req.flash(
                                    'error_msg',
                                    'Book not found'
                                );
                                // errors = [];
                                // res.redirect('/books');
                            }
                        });
                    } else {
                        req.flash(
                            'error_msg',
                            'No authors found'
                        );
                        // errors = [];
                        // res.redirect('/books/');
                    }
                });
            }
            logger.error(`Field error in update book`);
        });
        // req.flash(
        //     'error_msg',
        //     'Error in updating Book!'
        // );
        res.redirect('/books/edit/req.params.id');
        // req.session.flash = [];
    } else {
        console.info('else');
        const start = process.hrtime();
        Book.update(book, {
            where: {id: req.params.id, createdBy: req.user.id}
        })
            .then(data => {
                //create book author
                db.sequelize.query("delete from bookAuthors where bookId = " + req.params.id, { type: QueryTypes.UPDATE })
                    .then(function(booksDeleted){
                        for (var i = 0; i < bookAuthors.length; i++) {
                            const bookauthors = {
                                bookId: req.params.id,
                                authorId: bookAuthors[i]
                            }
                            BookAuthor.create(bookauthors)
                                .then(data2 => {
                                    if(!data2){
                                        errors.push({
                                            msg: 'Error in adding book author'
                                        });
                                    }
                                });
                        }
                });
                
                for (var i = 0; i < req.files.length; i++) {
                    // s3path = s3utils.putObject(req.files[i].path);
                    // console.info("S3 path: " + req.files[i]);
                    const bookimages = {
                        bookId: req.params.id,
                        imagePath: req.files[i].location,    // full path to the uploaded file
                        imageBucket: req.files[i].bucket,
                        imageName: req.files[i].key,
                        imageType: req.files[i].contentType
                    }
                    // destination: dir and filename: file name at saved location
                    BookImage.create(bookimages)
                        .then(data2 => {
                            if(!data2){
                                errors.push({
                                    msg: 'Error in adding book image'
                                });
                            }
                        });
                }
            
                // console.info("data:" + data)
                if(data) {
                    const durationInMilliseconds = util.getDurationInMilliseconds(start);
                    client.timing('user_update_book_query', durationInMilliseconds);
                    req.flash(
                        'success_msg',
                        'Book updated successfully'
                    );
                    res.redirect('/books');
                    errors = [];
                } else {
                    req.flash(
                        'error_msg',
                        'Error in updating Book!'
                    );
                    res.redirect('/books/edit/req.params.id');
                    errors = [];
                    logger.error(`Error in updating book`);
                }
            })
            .catch(err => {
                req.flash(
                    'error_msg',
                    'Error occurred in updating book!'
                );
                // console.info('update error', err);
                logger.error(`Error in updating book`, {tags: 'http', additionalInfo: {error: err}});
                res.redirect('/books/edit/req.params.id');
            });
    }
    logger.info(`Requested ${req.method} ${req.originalUrl}`, {tags: 'http', additionalInfo: {body: req.body, headers: req.headers }});
});

router.get('/delete/:id', ensureAuthenticated, function(req, res, next) {

    console.info("req.params.id" + req.params.id);
    // Validate request
    Book.findOne({ where: { id: req.params.id , createdBy: req.user.id, isDeleted: false}
    })
    .then(book => {
        if(book){
            const start = process.hrtime();
            book.update({
                isDeleted: true
            }).then(data => {
                const durationInMilliseconds = util.getDurationInMilliseconds(start);
                client.timing('user_delete_book_query', durationInMilliseconds);
                BookImage.findAll({ where: { bookId: book.id}
                })
                .then(bookImages => {
                    for (var i = 0; i < bookImages.length; i++) {
                        console.info("File deleting... " + bookImages[i].imageName);
                        s3utils.deleteS3Object(bookImages[i]);
                    }
                })                
                req.flash(
                    'success_msg',
                    'Book deleted successfully!'
                );
                res.redirect('/books');
            })
            .catch(err => {
                req.flash(
                    'error_msg',
                    'Error occurred in deleting book!'
                );
                // console.info('delete error', err);
                logger.error(`Error in deleting book`, {tags: 'http', additionalInfo: {error: err}});
                res.redirect('/books');
            });
        } else {
            req.flash(
                'error_msg',
                'Invalid book selected!'
            );
            res.redirect('/books');
            logger.error(`Invalid book selected`);
        }
    })
    .catch(err => {
        req.flash(
            'error_msg',
            'Invalid book selected!'
        );
        res.redirect('/books');
        logger.error(`Error retrieving book info for delete`, {tags: 'http', additionalInfo: {error: err}});
    });
    logger.info(`Requested ${req.method} ${req.originalUrl}`, {tags: 'http', additionalInfo: {body: req.body, headers: req.headers }});
});

router.get('/image/:imageFile', ensureAuthenticated, (req, res, next) => {
    // AWS.config.update({
    //     accessKeyId: "Your Key Goes Here",
    //     secretAccessKey: "Your Secret Key Goes Here"
    //   });let s3 = new AWS.S3();

    BookImage.findOne({ where: { imageName: req.params.imageFile}
    })
    .then(bookImage => {

        // async function getImage() {
        //     const data = s3utils.s3.getObject(
        //         {
        //             Bucket: s3utils.aws_s3_bucket,
        //             Key: bookImage.imageName
        //         }

        //     ).promise();
        //     return data;
        // }
        if(bookImage){
            var data = s3utils.getS3Object(bookImage);
            console.info("fileData: " + data);
            if(data){
                // res.writeHead(200, {'Content-Type': 'image/jpeg'});
                res.write(data.Body, 'binary');
                res.write(data);
                res.end(null, 'binary');
            } else {
                res.writeHead(200, {'Content-Type': 'text'});
                res.write('Image not found');
                res.end(null, 'text');
            }
        }

        // s3.getObject({
        //         Bucket: s3utils.aws_s3_bucket,
        //         Key: bookImage.imageName
        //     }, function(err, data) {
        //         res.writeHead(200, {'Content-Type': bookImage.imageType});
        //         res.write(data.Body, 'binary');
        //         res.end(null, 'binary');
        // });

        // getImage()
        //     .then((img) => {
        //         let image = "<img src='data:"+bookImage.imageType+";base64," + encode(img.Body) + "'" + "/>";                
        //         res.send(image)
        //     }).catch((e) => {
        //         res.send("No image")
        //         log.error(e);
        //     });

        // function encode(data) {
        //     let buf = Buffer.from(data);
        //     let base64 = buf.toString('base64');
        //     return base64
        // }
    });
    logger.info(`Requested ${req.method} ${req.originalUrl}`, {tags: 'http', additionalInfo: {body: req.body, headers: req.headers }});
});

router.get('/deleteImage/:id', ensureAuthenticated, function(req, res, next) {

    console.info("delete image req.params.id" + req.params.id);
    // Validate request
    BookImage.findOne({ where: { id: req.params.id}
    })
    .then(bookImage => {
        console.info("Image found for delete");
        BookImage.destroy({ where: { id: req.params.id }
        })
        .then(function() {
            console.info("Image deleted successfully");
            //delete s3 item
            s3utils.deleteS3Object(bookImage);
            res.send('success');
        })
        .catch(err => {
            res.send('failed');
            logger.error(`Error deleting book image`, {tags: 'http', additionalInfo: {error: err}});
        });
    })
    .catch(err => {
        res.send('failed');
        logger.error(`Error retrieving book for delete image`, {tags: 'http', additionalInfo: {error: err}});
    });
    logger.info(`Requested ${req.method} ${req.originalUrl}`, {tags: 'http', additionalInfo: {body: req.body, headers: req.headers }});
});

router.use(function (err, req, res, next) {
    if (err) {
        console.log('Error', err);
    } else {
        console.log('404')
    }
});

module.exports = router;
