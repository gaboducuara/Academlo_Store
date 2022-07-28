const express = require('express');

// Controllers
const {
	PostCreateUser,
	PostLoginUser,
	getAllUser,
	PatchUpdateUser,
	DeleteUser,
	getAllOrderUser,
	getOrderById,
	getAllProductsMe,
} = require('../controllers/users.controller');

// Middlewares
const { createUserValidators } = require('../middlewares/validators.middleware');

const { userExists } = require('../middlewares/users.middleware');
const { orderExists } = require('../middlewares/order.middlewares');

const { protectSession, protectUserAccount } = require('../middlewares/auth.middleware');

const usersRouter = express.Router();

usersRouter.post('/', createUserValidators, PostCreateUser);

usersRouter.post('/login', PostLoginUser);

usersRouter.use(protectSession);

usersRouter.get('/', getAllUser);

usersRouter.get('/me', getAllProductsMe);

usersRouter.get('/orders', getAllOrderUser);

usersRouter.get('/orders/:id', orderExists, getOrderById);

usersRouter
	.use('/:id', userExists)
	.route('/:id')
	.patch(protectUserAccount, PatchUpdateUser)
	.delete(protectUserAccount, DeleteUser);

module.exports = { usersRouter };
