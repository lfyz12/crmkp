const {ApiError} = require('../error/ApiError')
const {Order, Client} = require("../models/models");

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

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const rowsDeleted = await Order.destroy({ where: { id } });
            if (!rowsDeleted) return next(ApiError.badRequest('Клиент не найден'));
            res.status(204).send();
        } catch (error) {
            next(ApiError.internal());
        }
    }
}

module.exports = new OrderController()