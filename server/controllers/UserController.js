const ApiError = require('../error/ApiError')
const {User} = require("../models/models");

class UserController {
    async register(req, res, next) {
        try {
            const { email, password } = req.body;
            const user = await User.create({ email, password }); // Assume password is hashed at middleware level
            res.status(201).json(user);
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ where: { email } });
            if (!user || user.password !== password) {
                return next(ApiError.unauthorized());
            }
            res.json({ message: 'Успешный вход', user });
        } catch (error) {
            next(ApiError.internal());
        }
    }
}

module.exports = new UserController()