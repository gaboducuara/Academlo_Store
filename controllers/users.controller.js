const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

const { User } = require('../models/users.model.js');
const { Order } = require('../models/orders.model');
const { Products } = require('../models/products.model');
const { Productimgs } = require('../models/productimg.model');
const { Cart } = require('../models/carts.model');
const { Categories } = require('../models/categories.model');
const { ProductsInCart } = require('../models/productsInCart.model');

// utils
const { catchAsync } = require('../utils/catchAsync.util');
const { AppError } = require('../utils/appError.util');
const { Email } = require('../utils/email.util');

// dotenv
dotenv.config({ path: '../config.env' });
/// controllers
const PostCreateUser = catchAsync(async (req, res, next) => {
	const { username, email, password, role } = req.body;

	const salt = await bcrypt.genSalt(12);
	const hashPassword = await bcrypt.hash(password, salt);

	const newUser = await User.create({
		username: username,
		email,
		password: hashPassword,
		role,
	});

	newUser.password = undefined;

	await new Email(email).sendWelcome(username);

	res.status(201).json({
		status: 'success',
		newUser,
	});
});

const PostLoginUser = catchAsync(async (req, res, next) => {
	const { email, password } = req.body;

	const user = await User.findOne({
		where: {
			email,
			status: 'active',
		},
	});

	if (!user) {
		return next(new AppError('Credentials invalid', 400));
	}

	const isPasswordValid = await bcrypt.compare(password, user.password);

	if (!isPasswordValid) {
		return next(new AppError('Credentials invalid', 400));
	}

	// Generate JWT (JsonWebToken) ->
	const token = await jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
		expiresIn: '30d',
	});

	// Send response
	res.status(200).json({
		status: 'success',
		token,
	});
});

const getAllUser = catchAsync(async (req, res, next) => {
	const { sessionUser } = req;
	const role = sessionUser.role;

	if (role === 'admin') {
		const users = await User.findAll({
			attributes: ['id', 'username', 'email', 'status', 'role'],
		});

		res.status(201).json({
			status: 'success',
			users,
		});
	} else {
		return next(new AppError('Admin permission required', 400));
	}
});

const PatchUpdateUser = catchAsync(async (req, res, next) => {
	const { user } = req;
	const { username, email } = req.body;

	await user.update({ username, email });

	res.status(201).json({ status: 'success', user });
});

const DeleteUser = catchAsync(async (req, res, next) => {
	const { user } = req;

	// await user.destroy();
	await user.update({ status: 'inactive' });

	res.status(201).json({ status: 'success', user });
});

const getAllProductsMe = catchAsync(async (req, res, next) => {
	const { sessionUser } = req;

	const product = await Products.findAll({
		where: { userId: sessionUser.id },
		attributes: [
			'id',
			'title',
			'description',
			'price',
			'quantity',
			'categoryId',
			'userId',
			'status',
		],
		include: [
			{
				model: Categories,
				required: false,
				where: { status: 'active' },
				attributes: ['id', 'name', 'status'],
			},
			{
				model: Productimgs,
				required: false,
				where: { status: 'active' },
				attributes: ['id', 'imgUrl', 'productId', 'status'],
			},
		],
	});

	if (product === undefined) {
		return next(new AppError('This user not has products', 400));
	} else {
		res.status(201).json({
			status: 'success',
			product,
		});
	}
});

const getAllOrderUser = catchAsync(async (req, res, next) => {
	const { sessionUser } = req;

	const product = await Products.findAll({
		where: { userId: sessionUser.id },
		attributes: [
			'id',
			'title',
			'description',
			'price',
			'quantity',
			'categoryId',
			'userId',
			'status',
		],
		include: [
			{
				model: Categories,
				required: false,
				where: { status: 'active' },
				attributes: ['id', 'name', 'status'],
			},
			{
				model: Productimgs,
				required: false,
				where: { status: 'active' },
				attributes: ['id', 'imgUrl', 'productId', 'status'],
			},
		],
	});

	if (product === undefined) {
		return next(new AppError('This user not has products', 400));
	} else {
		res.status(201).json({
			status: 'success',
			product,
		});
	}
});

const getOrderById = catchAsync(async (req, res, next) => {
	const { order } = req;

	const orderId = await Order.findOne({
		where: { status: 'active', id: order.id },
		attributes: ['id', 'userId', 'cartId', 'totalPrice', 'status'],
		include: [
			{
				model: Cart,
				required: false,
				where: { status: 'active' },
				attributes: ['id', 'userId', 'status'],
				include: [
					{
						model: ProductsInCart,
						required: false,
						where: { status: 'purchased' },
						attributes: ['id', 'cartId', 'productId', 'quantity', 'status'],
					},
				],
			},
		],
	});

	res.status(201).json({
		status: 'success',
		orderId,
	});
});
module.exports = {
	PostCreateUser,
	PostLoginUser,
	getAllUser,
	PatchUpdateUser,
	DeleteUser,
	getAllOrderUser,
	getOrderById,
	getAllProductsMe,
};
