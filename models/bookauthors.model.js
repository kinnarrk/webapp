module.exports = (sequelize, Sequelize) => {
    const BookAuthor = sequelize.define("bookAuthors", {
        bookId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {         // books belongsTo books 1:1
                model: 'books',
                key: 'id'
            }
        },
        authorId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {         // authors belongsTo authors 1:1
                model: 'authors',
                key: 'id'
            }
        }
    });
    BookAuthor.associate = function(models) {
        BookAuthor.belongsTo(models.Book, {foreignKey: 'bookId', as: 'bookId'})
    };
    BookAuthor.associate = function(models) {
        BookAuthor.belongsTo(models.Author, {foreignKey: 'authorId', as: 'authorId'})
    };
    return BookAuthor;
};
