var express = require('express');
var router = express.Router();

const passport = require('passport');

const db = require("../models");
const Book = db.books;
const Author = db.authors;
const BookAuthor = db.bookAuthors;
const User = db.users;
const Op = db.Sequelize.Op;
const { QueryTypes } = require('sequelize');

const {
    ensureAuthenticated
} = require('../config/auth');

router.get('/', ensureAuthenticated, (req, res) => {
    errors = [];
    db.sequelize.query("SELECT b.id id, b.isbn isbn, b.title title, date_format(b.publicationDate, '%m/%d/%Y') publicationDate, b.quantity quantity, " +
                                    " b.price price, group_concat(a.name) as author, " +
                                    " concat(u.first_name, ' ', u.last_name) as sellerName, b.createdBy as createdBy, ANY_VALUE(bi.imageName) as bookImage, ANY_VALUE(bi.imageType) as imageType, ANY_VALUE(bi.imagePath) as imagePath " +
                                    " FROM books b join bookAuthors ba on b.id = ba.bookId " +
                                    " join authors a on a.id = ba.authorId join users u on u.id = b.createdBy " +
                                    " left join bookImages bi on b.id = bi.bookId " +
                                    " where b.isDeleted = 0 and b.quantity > 0 GROUP BY id ORDER BY b.price ASC, b.quantity DESC", { type: QueryTypes.SELECT })
        .then(function(books){
            res.render('catalogue', {books: books});
            req.session.flash = [];
        });
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
        }
    });
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
                console.info("in add 2....");
                if(bookAuthors) {
                    console.info("in add 3....");
                    Author.findAll( {
                    }).then(authors => {
                        console.info("in add 22....");
                        if(authors) {
                            // console.info("in add 33...." + book);
                            res.render('addBook', {book: book, bookAuthors: bookAuthors, authors: authors});
                        } else {
                            req.flash(
                                'error_msg',
                                'No authors found'
                            );
                            errors = [];
                            res.redirect('/books');
                        }
                    });
                } else {
                    req.flash(
                        'error_msg',
                        'Book not found'
                    );
                    errors = [];
                    res.redirect('/books');
                }
            });

        } else {
            req.flash(
                'error_msg',
                'Book not found'
            );
            errors = [];
            res.redirect('/books');
        }
    })
    .catch(err => {
        req.flash(
            'error_msg',
            'Error occurred in getting book details!'
        );
        console.info('edit error', err);
        res.redirect('/books');
    });
});

router.post('/create', ensureAuthenticated, function(req, res, next) {
    const {
        isbn,
        title,
        publicationDate,
        quantity,
        price,
        authors
    } = req.body;
    errors = [];
    // Validate request
    console.info("authors:" + req.body['authors[]'])
    if (!req.body.isbn || !req.body.title || !req.body.publicationDate || !req.body.quantity || !req.body.price || !req.body['authors[]']) {
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
    const bookAuthors = req.body['authors[]'];

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
    } else {
        // console.info('else');
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
                console.info("data:" + data)
                if(data) {
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
                }
            })
            .catch(err => {
                req.flash(
                    'error_msg',
                    'Error occurred in adding book!'
                );
                console.info('insert error', err);
                res.redirect('/books');
            });

    }
});

router.post('/update/:id', ensureAuthenticated, function(req, res, next) {
    const {
        isbn,
        title,
        publicationDate,
        quantity,
        price,
        authors
    } = req.body;
    errors = [];
    console.info("req.params.id" + req.params.id);
    // Validate request
    console.info("authors:" + req.body['authors[]'])
    if (!req.body.isbn || !req.body.title || !req.body.publicationDate || !req.body.quantity || !req.body.price || !req.body['authors[]']) {
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
    const bookAuthors = req.body['authors[]'];

    if (errors.length > 0) {
        console.info('errors.length', errors.length);
        BookAuthor.findAll( { where: { bookId: book.id }
        }).then(bookAuthors => {
            console.info("in add 2....");
            if (bookAuthors) {
                Author.findAll({}).then(authors => {
                    // console.info("in add 2....");
                    if (authors) {
                        // console.info("in add 3....");
                        res.render('addBook', {errors, book: book, bookAuthors: bookAuthors, authors: authors});
                    } else {
                        req.flash(
                            'error_msg',
                            'No authors found'
                        );
                        errors = [];
                        res.redirect('/books/');
                    }
                });
            }
        });
        // req.flash(
        //     'error_msg',
        //     'Error in updating Book!'
        // );
        res.redirect('/books/edit/req.params.id');
        req.session.flash = [];
    } else {
        // console.info('else');
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
                // console.info("data:" + data)
                if(data) {
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
                }
            })
            .catch(err => {
                req.flash(
                    'error_msg',
                    'Error occurred in updating book!'
                );
                console.info('update error', err);
                res.redirect('/books/edit/req.params.id');
            });
    }
});

router.get('/delete/:id', ensureAuthenticated, function(req, res, next) {

    console.info("req.params.id" + req.params.id);
    // Validate request
    Book.findOne({ where: { id: req.params.id , createdBy: req.user.id, isDeleted: false}
    })
    .then(book => {
        if(book){
            book.update({
                isDeleted: true
            }).then(data => {
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
                console.info('delete error', err);
                res.redirect('/books');
            });
        } else {
            req.flash(
                'error_msg',
                'Invalid book selected!'
            );
            res.redirect('/books');
        }
    })
    .catch(err => {
        req.flash(
            'error_msg',
            'Invalid book selected!'
        );
        res.redirect('/books');
    });
});

router.use(function (err, req, res, next) {
    if (err) {
        console.log('Error', err);
    } else {
        console.log('404')
    }
});

module.exports = router;
