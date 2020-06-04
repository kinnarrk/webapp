module.exports = (sequelize, Sequelize) => {
    const Book = sequelize.define("books", {
        isbn: {
            type: Sequelize.STRING
        },
        title: {
            type: Sequelize.STRING
        },
        publicationDate: {
            type: Sequelize.DATE,
            // get: function()  {
            //     var pubDate = this.getDataValue('publicationDate');
            //     var datePartsInter = pubDate.split(" ")[0];
            //     var dateParts = datePartsInter.split("-");
            //     return dateParts[1] + "/" + dateParts[2] + "/" + dateParts[0];
            // }
        },
        quantity: {
            type: Sequelize.INTEGER
        },
        price: {
            type: Sequelize.DECIMAL(10,2)
        },
        createdBy: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {         // User belongsTo User 1:1
                model: 'users',
                key: 'id'
            }
        },
        updatedBy: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {         // User belongsTo User 1:1
                model: 'users',
                key: 'id'
            }
        },
        isDeleted: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    });
    // Book.belongsTo(User);
    Book.associate = function(models) {
        Book.belongsTo(models.User, {foreignKey: 'createdBy', as: 'createdBy'});
        Book.hasMany(models.BookAuthor, {foreignKey: 'bookId', as: 'bookId'});
        Book.hasMany(models.CartBook, {as: 'CartBooks'});
    };
    // Book.associate = function(models) {
    //     Book.belongsTo(models.User, {foreignKey: 'updatedBy', as: 'updatedBy'})
    // };
    // Book.associate = function(models) {
    //     Book.hasMany(models.BookAuthor, {as: 'bookAuthors'})
    // };
    // Book.associate = function(models) {
    //     Book.hasMany(models.CartBook, {as: 'CartBooks'})
    // };
    return Book;
};
