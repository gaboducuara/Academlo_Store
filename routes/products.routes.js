const express = require('express');

//controllers

const {
	PostCreateProduct,
	getAllProduct,
	getproductById,
	PatchUpdateProduct,
	DeleteProduct,
	getAllCategoriesProduct,
	PostoneCategoriesProduct,
	PatchCategoriesProduct,
} = require('../controllers/products.controller');

// Middlewares
const {
	createCategoriesValidators,
	createProductValidators,
} = require('../middlewares/validators.middleware');
const { productExists } = require('../middlewares/product.middleware');
const { categoryExists } = require('../middlewares/categories.middleware');
const { protectSession } = require('../middlewares/auth.middleware');

// Utils
const { upload } = require('../utils/upload.util');

const productsRouter = express.Router();

productsRouter.get('/categories', getAllCategoriesProduct);
productsRouter.get('/', getAllProduct);
productsRouter.get('/:id', productExists, getproductById);

productsRouter.use(protectSession);

productsRouter.post(
	'/',
	upload.array('productImg', 5),
	createProductValidators,
	categoryExists,
	PostCreateProduct
);

productsRouter.patch('/:id', productExists, PatchUpdateProduct);

productsRouter.delete('/:id', productExists, DeleteProduct);

productsRouter.post('/categories', createCategoriesValidators, PostoneCategoriesProduct);

productsRouter.patch('/categories/:id', categoryExists, PatchCategoriesProduct);

module.exports = { productsRouter };
