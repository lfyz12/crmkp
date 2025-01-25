const {ApiError} = require('../error/ApiError')
const {Order} = require("../models/models");

class OrderController {
    async create(req, res, next) {
        try {
            const { clientId, orderDetails, totalAmount } = req.body;
            const order = await Order.create({ clientId, orderDetails, totalAmount });
            res.status(201).json(order);
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async getByClient(req, res, next) {
        try {
            const { clientId } = req.params;
            const orders = await Order.findAll({ where: { clientId } });
            res.json(orders);
        } catch (error) {
            next(ApiError.internal());
        }
    }
}

module.exports = new OrderController()