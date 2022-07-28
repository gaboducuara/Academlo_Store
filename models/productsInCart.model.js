const { db, DataTypes } = require('../utils/database.util');

// Create our first model (table)
const ProductsInCart = db.define('productsIncart', {
	id: {
		primaryKey: true,
		type: DataTypes.INTEGER,
		autoIncrement: true,
		allowNull: false,
	},
	cartId: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	productId: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	quantity: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	status: {
		type: DataTypes.STRING,
		allowNull: false,
		defaultValue: 'active',
	},
});

module.exports = { ProductsInCart };
