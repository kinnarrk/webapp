module.exports = (sequelize, Sequelize) => {
    const BookImage = sequelize.define("bookImages", {
        bookId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {         // books belongsTo books 1:1
                model: 'books',
                key: 'id'
            }
        },
        imagePath: {
            type: Sequelize.STRING,
            allowNull: false
        },
        imageBucket: {
            type: Sequelize.STRING,
            allowNull: true
        },
        imageName: {
            type: Sequelize.STRING,
            allowNull: true
        },
        imageType: {
            type: Sequelize.STRING,
            allowNull: true
        }
    });
    BookImage.associate = function(models) {
        BookImage.belongsTo(models.Book, {foreignKey: 'bookId', as: 'bookId'});
    };
    return BookImage;
};
