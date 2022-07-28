const { db, DataTypes } = require('../utils/database.util');

// Create our first model (table)
const Productimgs = db.define('Productimg', {
	id: {
		primaryKey: true,
		type: DataTypes.INTEGER,
		autoIncrement: true,
		allowNull: false,
	},
	imgUrl: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	productId: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	status: {
		type: DataTypes.STRING,
		allowNull: false,
		defaultValue: 'active',
	},
});

module.exports = { Productimgs };
