// Models
const { Products } = require('../models/products.model');
const { Productimgs } = require('../models/productimg.model');

// Utils
const { catchAsync } = require('../utils/catchAsync.util');
const { AppError } = require('../utils/appError.util');

const productExists = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const { productId } = req.body;

	const product = await Products.findOne({
		where: { id: productId || id, status: 'active' },
		include: { model: Productimgs },
	});

	if (!product) {
		return next(new AppError('Product not found', 404));
	}

	req.product = product;
	next();
});

module.exports = { productExists };
