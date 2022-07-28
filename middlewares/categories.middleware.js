// Models
const { Categories } = require('../models/categories.model');

// Utils
const { AppError } = require('../utils/appError.util');
const { catchAsync } = require('../utils/catchAsync.util');

const categoryExists = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const { categoryId } = req.body;

	const category = await Categories.findOne({
		where: { id: categoryId || id, status: 'active' },
	});

	if (!category) {
		return next(new AppError('Category not found', 404));
	}

	req.category = category;
	next();
});

module.exports = { categoryExists };
