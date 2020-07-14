var express = require('express');
var router = express.Router();

const passport = require('passport');

const db = require("../models");
const Book = db.books;
const Author = db.authors;
const BookAuthor = db.bookAuthors;
const Cart = db.carts;
const CartBook = db.cartBooks;
const User = db.users;
const Op = db.Sequelize.Op;
const { QueryTypes } = require('sequelize');

var logger = require('../config/winston');

var StatsD = require('node-statsd'),
      client = new StatsD();

var util = require('../lib/utils');
router.use((req, res, next) => {
    const start = process.hrtime()
    res.on('finish', () => {            
        const durationInMilliseconds = util.getDurationInMilliseconds(start);
        var metric_name = req.originalUrl.replace(/\/\d+/g, "");    //remove query parameter
        metric_name = "url" + metric_name.replace(/[|&;$%@"<>()+,\/]/g, "-");
        client.timing(metric_name, durationInMilliseconds);
    })        
    next()
})

const {
    ensureAuthenticated
} = require('../config/auth');

router.get('/view', ensureAuthenticated, (req, res) => {
    errors = [];
    const start = process.hrtime();
    db.sequelize.query("SELECT ANY_VALUE(b.id) id, ANY_VALUE(b.isbn) isbn, ANY_VALUE(b.title) title, DATE_FORMAT(ANY_VALUE(b.publicationDate), '%m/%d/%Y') publicationDate, ANY_VALUE(cb.quantity) quantity, ANY_VALUE(b.quantity) quantity1, " +
        " ANY_VALUE(b.price) price, GROUP_CONCAT(a.name) AS author, ANY_VALUE(b.createdBy) AS createdBy, ANY_VALUE(cb.id) as cartBookId, ANY_VALUE(bi.imageName) as bookImage, ANY_VALUE(bi.imageType) as imageType, group_concat(DISTINCT(bi.imagePath)) as imagePath "+
        " FROM books b JOIN bookAuthors ba ON b.id = ba.bookId "+
        " JOIN authors a ON a.id = ba.authorId JOIN users u ON u.id = b.createdBy "+
        " JOIN cartBooks cb ON cb.bookId = b.id JOIN carts c ON c.id = cb.cartId "+
        " left join bookImages bi on b.id = bi.bookId " +
        " WHERE b.isDeleted = 0 AND cb.quantity > 0 AND c.createdBy = "+req.user.id+" GROUP BY id ORDER BY ANY_VALUE(b.price) ASC", { type: QueryTypes.SELECT })
        .then(function(books){
            const durationInMilliseconds = util.getDurationInMilliseconds(start);
            client.timing('cart_list_book_query', durationInMilliseconds);
            res.render('cart', {books: books});
            req.session.flash = [];
        });
    logger.info(`Requested ${req.method} ${req.originalUrl}`, {tags: 'http', additionalInfo: {body: req.body, headers: req.headers }});
});

router.post('/add/:id', ensureAuthenticated, (req, res, next) => {
    let errors = [];
    const start = process.hrtime();
    Book.findOne({ where: {
            id: req.params.id,
            createdBy: {[Op.not]: req.user.id},
            quantity: {[Op.gte]: parseInt(req.body.quantity)},
            isDeleted: false}
    })
    .then(book => {
        if(book){   // if not own book, qty > 0 and not deleted
            Cart.findOne({ where: { createdBy: req.user.id }
            })
            .then(cart => {
                if(cart){   // if user's cart already exists then add into that
                    CartBook.findOne({ where: { bookId: req.params.id, cartId: cart.id }
                    })
                    .then(cartBook => {
                        if(cartBook){   // book already exists in cart. Update qty
                            cartBook.update({
                                quantity: cartBook.quantity + parseInt(req.body.quantity)
                            }).then(data => {
                                book.update({quantity: book.quantity - parseInt(req.body.quantity)})
                                    .then(data => {});
                                req.flash(
                                    'success_msg',
                                    book.title + ' added to cart!'
                                );
                                res.redirect('/catalogue');
                            })
                            .catch(err => {
                                req.flash(
                                    'error_msg',
                                    'Unable to add to cart!'
                                );
                                logger.error(`Error updating cart quantity`, {tags: 'http', additionalInfo: {error: err}});
                                res.redirect('/catalogue');
                            });
                        } else {    //add new entry to existing cart
                            const cartbook = {
                                cartId: cart.id,
                                bookId: req.params.id,
                                quantity: req.body.quantity
                            };
                            CartBook.create(cartbook)
                                .then(cartb => {
                                    if(cartb){
                                        //success
                                        // Don't update the book quantity just by adding to cart
                                        // book.update({quantity: book.quantity - parseInt(req.body.quantity)})
                                        //     .then(data => {});
                                        const durationInMilliseconds = util.getDurationInMilliseconds(start);
                                        client.timing('cart_add_book_query', durationInMilliseconds);
                                        req.flash(
                                            'success_msg',
                                            book.title + ' added to cart!'
                                        );
                                        res.redirect('/catalogue');
                                    } else {
                                        // fail
                                        req.flash(
                                            'error_msg',
                                            'Unable to add to cart!'
                                        );
                                        res.redirect('/catalogue');
                                    }
                                })
                                .catch(err => {
                                    req.flash(
                                        'error_msg',
                                        'Invalid book selected!'
                                    );
                                    res.redirect('/catalogue');
                                });
                        }
                    })
                    .catch(err => {
                        req.flash(
                            'error_msg',
                            'Error occurred in deleting book!'
                        );
                        logger.error(`Error finding book cart match`, {tags: 'http', additionalInfo: {error: err}});
                        res.redirect('/catalogue');
                    });
                } else {
                    const cart = {
                        createdBy: req.user.id
                    };
                    Cart.create(cart)
                        .then(cart1 => {
                            const cartbook = {
                                cartId: cart1.id,
                                bookId: req.params.id,
                                quantity: req.body.quantity
                            };
                            CartBook.create(cartbook)
                                .then(cartb => {
                                    if(cartb){
                                        //success
                                        // Not to update qty
                                        // book.update({quantity: book.quantity - parseInt(req.body.quantity)})
                                        //     .then(data => {});
                                        const durationInMilliseconds = util.getDurationInMilliseconds(start);
                                        client.timing('cart_add_book_query', durationInMilliseconds);
                                        req.flash(
                                            'success_msg',
                                            book.title + ' added to cart!'
                                        );
                                        res.redirect('/catalogue');
                                    } else {
                                        // fail
                                        req.flash(
                                            'error_msg',
                                            'Unable to add to cart!'
                                        );
                                        res.redirect('/catalogue');
                                    }
                                })
                                .catch(err => {
                                    req.flash(
                                        'error_msg',
                                        'Invalid book selected!'
                                    );
                                    logger.error(`Error creating cart book entry`, {tags: 'http', additionalInfo: {error: err}});
                                    res.redirect('/catalogue');
                                });

                        })
                        .catch(err => {
                            req.flash(
                                'error_msg',
                                'Invalid book selected!'
                            );
                            logger.error(`Error finding book to add to cart`, {tags: 'http', additionalInfo: {error: err}});
                            res.redirect('/catalogue');
                        });
                }
            })
            .catch(err => {
                req.flash(
                    'error_msg',
                    'Invalid book selected!'
                );
                logger.error(`Error finding book which was added to card by owner`, {tags: 'http', additionalInfo: {error: err}});
                res.redirect('/catalogue');
            });
        } else {
            req.flash(
                'error_msg',
                'Either book does not exist or not enough quantity'
            );
            // console.info('invalid book', err);
            res.redirect('/catalogue');
        }
    })
    .catch(err => {
        req.flash(
            'error_msg',
            'Error occurred in adding book to cart!'
        );
        // console.info('edit error', err);
        logger.error(`Error finding book to add to cart`, {tags: 'http', additionalInfo: {error: err}});
        res.redirect('/catalogue');
    });
    logger.info(`Requested ${req.method} ${req.originalUrl}`, {tags: 'http', additionalInfo: {body: req.body, headers: req.headers }});
});
router.get('/delete/:id', ensureAuthenticated, function(req, res, next) {

    console.info("req.params.id" + req.params.id);
    const start = process.hrtime();
    // Validate request
    CartBook.findOne({ where: { id: req.params.id }
    })
        .then(cartBook => {
            if(cartBook){   // book already exists in cart. Update qty
                const cbq = cartBook.quantity;
                const cbb = cartBook.bookId;
                // console.info("cbq:" + + cbq);
                cartBook.destroy({

                }).then(data => {
                    Book.findOne({
                        where: {
                            id: req.params.id
                        }
                    }).then(book => {
                        // book.update({quantity: book.quantity + cbq})
                        //     .then(data => {
                        //     });
                        // book.update({quantity: book.quantity + cbq})
                        //     .then(data => {});
                        // Again not to change the quantity since it's not a checkout
                        // db.sequelize.query("update books set quantity = (quantity + "+cbq+") where id = " + cbb, { type: QueryTypes.UPDATE })
                        const durationInMilliseconds = util.getDurationInMilliseconds(start);
                        client.timing('cart_delete_book_query', durationInMilliseconds);
                        req.flash(
                            'success_msg',
                            ' Removed from cart!'
                        );
                        res.redirect('/cart/view');
                    });
                })
                .catch(err => {
                    req.flash(
                        'error_msg',
                        'Unable to remove from cart!'
                    );
                    logger.error(`Error deleting book from cart`, {tags: 'http', additionalInfo: {error: err}});
                    res.redirect('/cart/view');
                });
            } else {
                req.flash(
                    'error_msg',
                    'Invalid book selected!'
                );
                res.redirect('/cart/view');

            }
        })
        .catch(err => {
            req.flash(
                'error_msg',
                'Error occurred in deleting book!'
            );
            logger.error(`Error fetching cart book entry for delete`, {tags: 'http', additionalInfo: {error: err}});
            res.redirect('/cart/view');
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
