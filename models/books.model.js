module.exports = (sequelize, Sequelize) => {
    const Book = sequelize.define("books", {
        isbn: {
            type: Sequelize.STRING
        },
        title: {
            type: Sequelize.STRING
        },
        publicationDate: {
            type: Sequelize.DATE
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
        }
    });
    Book.associate = function(models) {
        Book.belongsTo(models.User, {foreignKey: 'createdBy', as: 'createdBy'})
    };
    Book.associate = function(models) {
        Book.belongsTo(models.User, {foreignKey: 'updatedBy', as: 'updatedBy'})
    };
    Book.associate = function(models) {
        Book.hasMany(models.BookAuthor, {as: 'bookAuthor'})
    };
    return Book;
};
