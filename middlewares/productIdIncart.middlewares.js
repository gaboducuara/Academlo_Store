const { ProductsInCart } = require('../models/productsInCart.model');

// Utils
const { catchAsync } = require('../utils/catchAsync.util');
const { AppError } = require('../utils/appError.util');

const productInCartExists = catchAsync(async (req, res, next) => {
	const { id } = req.params;

	const productInCart = await ProductsInCart.findOne({
		where: { id, status: 'active' },
	});

	if (!productInCart) {
		return next(new AppError('ProductInCart not found', 404));
	}

	req.productInCart = productInCart;
	next();
});

module.exports = { productInCartExists };
