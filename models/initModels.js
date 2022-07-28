// Models
const { User } = require('./users.model');
const { Order } = require('./orders.model');
const { Cart } = require('./carts.model');
const { Products } = require('./products.model');
const { Categories } = require('./categories.model');
const { ProductsInCart } = require('./productsInCart.model');
const { Productimgs } = require('./productimg.model');

const initModels = () => {
	// 1 User <----> M Order
	User.hasMany(Order, { foreignKey: 'userId' });
	Order.belongsTo(User);

	// 1 User <----> M Product
	User.hasMany(Products, { foreignKey: 'userId' });
	Products.belongsTo(User);

	// 1 Cart <----> M ProductInCart
	Cart.hasMany(ProductsInCart, { foreignKey: 'cartId' });
	ProductsInCart.belongsTo(Cart);

	// 1 Product <----> M ProductImg
	Products.hasMany(Productimgs, { foreignKey: 'productId' });
	Productimgs.belongsTo(Products);

	// 1 User <----> 1 Cart
	User.hasOne(Cart, { foreignKey: { name: 'userId' } });
	Cart.belongsTo(User);

	// 1 Cart <----> 1 Order
	Cart.hasOne(Order, { foreignKey: { name: 'cartId' } });
	Order.belongsTo(Cart);

	// 1 Category <----> 1 Product
	Categories.hasOne(Products, { foreignKey: { name: 'categoryId' } });
	Products.belongsTo(Categories);

	// 1 Product <----> 1 ProductInCart
	Products.hasOne(ProductsInCart, { foreignKey: { name: 'productId' } });
	ProductsInCart.belongsTo(Products);
};

module.exports = { initModels };

// const initModels = () => {
// 	//Users
// 	// 1 User <----> M Order
// 	User.hasMany(Order, { foreignKey: 'userId' });
// 	Order.belongsTo(User);

// 	// 1 User <----> 1 Carts
// 	User.hasOne(Cart, { foreignKey: 'userId' });
// 	Cart.belongsTo(User);

// 	// 1 User <----> M products
// 	User.hasMany(Products, { foreignKey: 'userId' });
// 	Products.belongsTo(User);

// 	//Carts
// 	// 1 Cart < ---- > 1 Orders
// 	Cart.hasOne(Order, { foreignKey: 'cartId' });
// 	Order.belongsTo(Cart);

// 	// 1 cart < ---- > M ProductsInCart
// 	Cart.hasMany(ProductsInCart, { foreignKey: 'cartId' });
// 	ProductsInCart.belongsTo(Cart);

// 	// products
// 	// 1 products < ---- > M ProductImgs
// 	Products.hasMany(Productimgs, { foreignKey: 'productId' });
// 	Productimgs.belongsTo(Products);

// 	// 1 products < ---- > 1 productsIncart
// 	Products.hasOne(ProductsInCart, { foreignKey: 'productId' });
// 	ProductsInCart.belongsTo(Products);

// 	//1 Categories < ----- > 1 Products
// 	Categories.hasOne(Products, { foreignKey: 'categoryId' });
// 	Products.belongsTo(Categories);
// };

// module.exports = { initModels };
