const express = require('express');

//controllers
const {
	PostAddproduct,
	PatchUpdateproduct,
	DeleteProduct,
	PostpurchseProduct,
	getCart,
} = require('../controllers/carts.controller');

//Middlewares
const { cartExists } = require('../middlewares/cart.middleware');
const { productExists } = require('../middlewares/product.middleware');

const { protectSession } = require('../middlewares/auth.middleware');

const cartsRouter = express.Router();

cartsRouter.use(protectSession);
cartsRouter.get('/', getCart);
cartsRouter.post('/add-product', cartExists, productExists, PostAddproduct);
cartsRouter.patch('/update-cart', cartExists, productExists, PatchUpdateproduct);
cartsRouter.delete('/:productId', cartExists, DeleteProduct);
cartsRouter.post('/purchase', PostpurchseProduct);

module.exports = { cartsRouter };
