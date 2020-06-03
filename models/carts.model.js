module.exports = (sequelize, Sequelize) => {
    const Cart = sequelize.define("carts", {
        createdBy: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {         // User belongsTo User 1:1
                model: 'users',
                key: 'id'
            }
        }
    });
    Cart.associate = function(models) {
        Cart.belongsTo(models.User, {foreignKey: 'createdBy', as: 'createdBy'})
    };
    Cart.associate = function(models) {
        Cart.hasMany(models.CartBook, {as: 'cartBooks'})
    };
    return Cart;
};
