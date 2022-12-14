// Models
const { Cart } = require('../models/carts.model');

// Utils
const { AppError } = require('../utils/appError.util');
const { catchAsync } = require('../utils/catchAsync.util');

const cartExists = catchAsync(async (req, res, next) => {
	const { sessionUser } = req;

	let cart = await Cart.findOne({
		where: { userId: sessionUser.id, status: 'active' },
	});

	if (!cart) {
		cart = await Cart.create({ userId: sessionUser.id });
	}

	req.cart = cart;
	next();
});

module.exports = { cartExists };
