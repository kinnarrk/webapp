const env = process.env.NODE_ENV || 'development';
const dbConfig = require("../config/db.config.js")[env];

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    // operatorsAliases: false,
    // dialectOptions: {
    //     useUTC: false //for reading from database
    // },
    timezone: '-04:00', //for writing to database
    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require("./users.model.js")(sequelize, Sequelize);
db.books = require("./books.model.js")(sequelize, Sequelize);
db.authors = require("./authors.model.js")(sequelize, Sequelize);
db.bookAuthors = require("./bookauthors.model.js")(sequelize, Sequelize);
db.carts = require("./carts.model.js")(sequelize, Sequelize);
db.cartBooks = require("./cartbooks.model.js")(sequelize, Sequelize);

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
        db.authors.bulkCreate(authorData, { individualHooks: true })
    }
});

module.exports = db;
