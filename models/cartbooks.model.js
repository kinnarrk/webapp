module.exports = (sequelize, Sequelize) => {
    const CartBook = sequelize.define("cartBooks", {
        cartId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {         // authors belongsTo authors 1:1
                model: 'carts',
                key: 'id'
            }
        },
        bookId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {         // books belongsTo books 1:1
                model: 'books',
                key: 'id'
            }
        },
        quantity: {
            type: Sequelize.INTEGER
        }

    });
    CartBook.associate = function(models) {
        CartBook.belongsTo(models.Book, {foreignKey: 'bookId', as: 'bookId'})
    };
    CartBook.associate = function(models) {
        CartBook.belongsTo(models.Cart, {foreignKey: 'cartId', as: 'cartId'})
    };
    return CartBook;
};
