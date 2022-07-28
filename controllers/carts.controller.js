const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// const { Products } = require('../models/products.model');
const { Cart } = require('../models/carts.model');
const { ProductsInCart } = require('../models/productsInCart.model');
const { Categories } = require('../models/categories.model');
const { Order } = require('../models/orders.model');
const { Products } = require('../models/products.model');
// utils
const { catchAsync } = require('../utils/catchAsync.util');
const { AppError } = require('../utils/appError.util');

//controllers

const getCart = catchAsync(async (req, res, next) => {
	const getCart = await Cart.findOne({
		where: { status: 'active' },
		include: [
			{
				model: ProductsInCart,
				required: false,
				where: { status: 'active' },
				attributes: ['id', 'cartId', 'productId', 'quantity', 'status'],
				include: [
					{
						model: Products,
						required: false,
						where: { status: 'active' },
						attributes: ['title', 'description', 'price', 'categoryId'],
						include: [
							{
								model: Categories,
								required: false,
								where: { status: 'active' },
								attributes: ['name'],
							},
						],
					},
				],
			},
		],
	});
	res.status(201).json({
		status: 'success',
		getCart,
	});
});

const PostAddproduct = catchAsync(async (req, res, next) => {
	const { cart } = req;
	const { productId, quantity } = req.body;

	const productExistsId = await Products.findOne({
		where: { status: 'active', id: productId },
	});

	if (productExistsId) {
		if (productExistsId.quantity >= quantity) {
			const productExistsInCart = await ProductInCart.findOne({
				where: { productId, status: 'active' },
			});

			if (productExistsInCart) {
				if (productExistsInCart.status === 'removed') {
					await productExistsInCart.update({ status: 'active', quantity });

					res.status(201).json({
						status: 'success',
						productExistsInCart,
					});
				} else {
					next(new AppError('This product is already in the cart', 400));
				}
			} else {
				const newProductInCart = await ProductsInCart.create({
					cartId: cart.id,
					productId,
					quantity,
				});

				res.status(201).json({
					status: 'success',
					newProductInCart,
				});
			}
		} else {
			return next(new AppError('The quantity is greater than available', 400));
		}
	} else {
		return next(new AppError('This product not exist', 400));
	}
});

const PatchUpdateproduct = catchAsync(async (req, res, next) => {
	const { cart, sessionUser } = req;
	const { productId, newQty } = req.body;

	if (cart.userId === sessionUser.id) {
		const productExistsId = await Products.findOne({ where: { id: productId } });
		const productExistsInCart = await ProductsInCart.findOne({
			where: { id: productId },
		});

		if (productExistsInCart) {
			if (productExistsId.quantity >= newQty) {
				await productExistsInCart.update({ quantity: newQty });

				if (newQty === 0) {
					await productExistsInCart.update({ status: 'removed' });
				} else if (newQty > 0 && productExistsInCart.status === 'removed') {
					await productExistsInCart.update({ status: 'active' });
				}

				res.status(201).json({
					status: 'success',
					productExistsInCart,
				});
			} else {
				return next(new AppError('The quantity is greater than available', 400));
			}
		} else {
			return next(new AppError('This product not exist in the cart', 400));
		}
	} else {
		return next(new AppError('This user does not have a cart', 400));
	}
});

const DeleteProduct = catchAsync(async (req, res, next) => {
	const { cart, sessionUser } = req;
	const { productId } = req.params;

	if (cart.userId === sessionUser.id) {
		const productExistsInCart = await ProductsInCart.findOne({
			where: { status: 'active', id: productId },
		});

		if (productExistsInCart) {
			await productExistsInCart.update({ status: 'removed', quantity: 0 });
		} else {
			return next(new AppError('This product not exist in the cart', 400));
		}

		res.status(201).json({
			status: 'success',
			productExistsInCart,
		});
	}
});

const PostpurchseProduct = catchAsync(async (req, res, next) => {
	const { sessionUser } = req;

	const cartToPurchase = await Cart.findOne({
		where: { status: 'active', userId: sessionUser.id },
		attributes: ['id', 'userId', 'status'],
		include: [
			{
				model: ProductsInCart,
				required: false,
				where: { status: 'active' },
				attributes: ['id', 'cartId', 'productId', 'quantity', 'status'],
				include: [
					{
						model: Products,
						required: false,
						where: { status: 'active' },
						attributes: [
							'title',
							'description',
							'price',
							'categoryId',
							'quantity',
						],
					},
				],
			},
		],
	});

	if (!cartToPurchase) {
		return next(new AppError('This user not has a cart', 400));
	}

	const total = cartToPurchase.dataValues.productInCarts.reduce((acc, prod) => {
		acc + prod.quantity * prod.product.price, 0;
	});

	const statusPurchased = cartToPurchase.dataValues.productInCarts.map(async prod => {
		const productQuantity = await Products.findOne({ where: { id: prod.productId } });
		const newQty = productQuantity.quantity - prod.quantity;
		await productQuantity.update({ quantity: newQty });
		return await prod.update({ status: 'purchased' });
	});
	await cartToPurchase.update({ status: 'purchased' });
	await Promise.all(statusPurchased);

	console.log(total);

	const newOrder = await Order.create({
		userId: sessionUser.id,
		cartId: cartToPurchase.id,
		totalPrice: total,
	});

	res.status(201).json({
		status: 'success',
		cartToPurchase,
		newOrder,
	});
});

module.exports = {
	getCart,
	PostAddproduct,
	PatchUpdateproduct,
	DeleteProduct,
	PostpurchseProduct,
};
