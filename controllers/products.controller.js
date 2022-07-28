const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const dotenv = require('dotenv');

//models
const { Products } = require('../models/products.model');
const { Categories } = require('../models/categories.model');
const { Productimgs } = require('../models/productimg.model');
// const { ProductsInCart } = require('../models/productsInCart.model');

// utils
const { catchAsync } = require('../utils/catchAsync.util');
const { AppError } = require('../utils/appError.util');
const { storage } = require('../utils/firebase.util');

// dotenv
// dotenv.config({ path: '../config.env' });
/// controllers

const PostCreateProduct = catchAsync(async (req, res, next) => {
	const { title, description, price, categoryId, quantity } = req.body;
	const { sessionUser } = req;

	const newProduct = await Products.create({
		title,
		description,
		price,
		categoryId,
		userId: sessionUser.id,
		quantity,
	});

	if (req.files.length > 0) {
		const filesPromises = req.files.map(async file => {
			const imgRef = ref(storage, `products/${Date.now()}_${file.originalname}`);
			const imgRes = await uploadBytes(imgRef, file.buffer);

			return await Productimgs.create({
				productId: newProduct.id,
				imgUrl: imgRes.metadata.fullPath,
			});
		});

		await Promise.all(filesPromises);
	}

	res.status(201).json({
		status: 'success',
		newProduct,
	});
});

const getAllProduct = catchAsync(async (req, res, next) => {
	const products = await Products.findAll({
		where: { status: 'active' },
		attributes: [
			'id',
			'title',
			'description',
			'quantity',
			'price',
			'categoryId',
			'userId',
			'status',
		],
	});

	res.status(201).json({
		status: 'success',
		products,
	});
});

const getproductById = catchAsync(async (req, res, next) => {
	const { product } = req;
	const productId = await Products.findOne({
		where: { status: 'active', id: product.id },
		attributes: [
			'id',
			'title',
			'description',
			'quantity',
			'price',
			'categoryId',
			'userId',
			'status',
		],
	});

	const productImgsPromises = product.productImgs.map(async productImg => {
		const imgRef = ref(storage, productImg.imgUrl);

		const imgFullPath = await getDownloadURL(imgRef);

		productImg.imgUrl = imgFullPath;
	});

	await Promise.all(productImgsPromises);

	res.status(201).json({
		status: 'success',
		productId,
	});
});

const PatchUpdateProduct = catchAsync(async (req, res, next) => {
	const { products, sessionUser } = req;
	const { title, description, quantity, price } = req.body;

	const role = sessionUser.role;

	if (role === 'user') {
		await products.update({ title, description, quantity, price });
	} else {
		return next(new AppError('admin permission required', 400));
	}
	res.status(201).json({ status: 'success', products });
});

const DeleteProduct = catchAsync(async (req, res, next) => {
	const { products, sessionUser } = req;

	if (sessionUser.id === products.userId) {
		await products.update({ status: 'removed' });
	} else {
		return next(new AppError('Not authorized to update', 400));
	}

	res.status(201).json({
		status: 'success',
		products,
	});
});

const getAllCategoriesProduct = catchAsync(async (req, res, next) => {
	const categories = await Categories.findAll({
		where: { status: 'active' },
		attributes: ['id', 'name', 'status'],
	});

	res.status(201).json({
		status: 'success',
		categories,
	});
});

const PostoneCategoriesProduct = catchAsync(async (req, res, next) => {
	const { name } = req.body;

	const newCategory = await Categories.create({
		name,
	});

	res.status(201).json({
		status: 'success',
		newCategory,
	});
});

const PatchCategoriesProduct = catchAsync(async (req, res, next) => {
	const { categories } = req;
	const { name } = req.body;

	await category.update({ name });

	res.status(201).json({
		status: 'success',
		categories,
	});
});

module.exports = {
	PostCreateProduct,
	getAllProduct,
	getproductById,
	PatchUpdateProduct,
	DeleteProduct,
	getAllCategoriesProduct,
	PostoneCategoriesProduct,
	PatchCategoriesProduct,
};
