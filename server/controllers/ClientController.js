const ApiError = require('../error/ApiError')
const {Client} = require("../models/models");

class ClientController {
    async create(req, res, next) {
        try {
            const { name, email, phone } = req.body;
            const client = await Client.create({ name, email, phone });
            res.status(201).json(client);
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async getAll(req, res, next) {
        try {
            const clients = await Client.findAll();
            res.json(clients);
        } catch (error) {
            next(ApiError.internal());
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const client = await Client.findByPk(id);
            if (!client) return next(ApiError.badRequest('Клиент не найден'));
            res.json(client);
        } catch (error) {
            next(ApiError.internal());
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const rowsDeleted = await Client.destroy({ where: { id } });
            if (!rowsDeleted) return next(ApiError.badRequest('Клиент не найден'));
            res.status(204).send();
        } catch (error) {
            next(ApiError.internal());
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;
            const { name, email, phone } = req.body;

            // Проверяем существование клиента
            const client = await Client.findByPk(id);
            if (!client) {
                return next(ApiError.badRequest('Клиент не найден'));
            }

            // Обновляем поля
            const [updatedCount] = await Client.update(
                { name, email, phone },
                { where: { id } }
            );

            if (updatedCount === 0) {
                return next(ApiError.badRequest('Не удалось обновить клиента'));
            }

            // Получаем обновлённого клиента
            const updatedClient = await Client.findByPk(id);
            res.json(updatedClient);

        } catch (error) {
            next(ApiError.internal(error.message));
        }
    }
}

module.exports = new ClientController()