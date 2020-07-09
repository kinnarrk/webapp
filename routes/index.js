var express = require('express');
var router = express.Router();
const db = require("../models");

var logger = require('../config/winston');

var StatsD = require('node-statsd'),
      client = new StatsD();

var util = require('../lib/utils');
router.use((req, res, next) => {
    const start = process.hrtime()
    res.on('finish', () => {            
        const durationInMilliseconds = bcryptUtil.getDurationInMilliseconds(start);
        client.timing(`${req.originalUrl}`, durationInMilliseconds);
    })        
    next()
})

const {
  ensureAuthenticated
} = require('../config/auth');

/* GET home page. */
router.get('/', ensureAuthenticated, function(req, res, next) {
    db.authors.count().then(c => {
      if(c == 0){
          let authorData = [
              {'name':'William Shakespeare', 'createdAt': '2020-01-01 00:00:00', 'updatedAt': '2020-01-01 00:00:00'},
              {'name':'Agatha Christie', 'createdAt': '2020-01-01 00:00:00', 'updatedAt': '2020-01-01 00:00:00'},
              {'name':'Barbara Cartland', 'createdAt': '2020-01-01 00:00:00', 'updatedAt': '2020-01-01 00:00:00'},
              {'name':'Danielle Steel', 'createdAt': '2020-01-01 00:00:00', 'updatedAt': '2020-01-01 00:00:00'},
              {'name':'Stephen King', 'createdAt': '2020-01-01 00:00:00', 'updatedAt': '2020-01-01 00:00:00'},
              {'name':'Leo Tolstoy', 'createdAt': '2020-01-01 00:00:00', 'updatedAt': '2020-01-01 00:00:00'},
              {'name':'Ernest Hemingway', 'createdAt': '2020-01-01 00:00:00', 'updatedAt': '2020-01-01 00:00:00'},
              {'name':'J. K. Rowling', 'createdAt': '2020-01-01 00:00:00', 'updatedAt': '2020-01-01 00:00:00'},
              {'name':'Mark Twain', 'createdAt': '2020-01-01 00:00:00', 'updatedAt': '2020-01-01 00:00:00'},
              {'name':'Charles Dickens', 'createdAt': '2020-01-01 00:00:00', 'updatedAt': '2020-01-01 00:00:00'},
              {'name':'Franz Kafka', 'createdAt': '2020-01-01 00:00:00', 'updatedAt': '2020-01-01 00:00:00'}
          ];
          db.authors.bulkCreate(authorData, { individualHooks: true });
          // logger.info('Authors injected for the first time');
          logger.info("Authors injected for the first time");
      }
  });
  res.render('index', { title: 'Kinnar' });
  logger.info(`Requested ${req.method} ${req.originalUrl}`, {tags: 'http', additionalInfo: {body: req.body, headers: req.headers }});
  // logger.error(`Some testing error`);
  // var err = new Error('This is an error');
  // logger.error(`Some testing error`, {tags: 'http', additionalInfo: {error: err}});
});

module.exports = router;
