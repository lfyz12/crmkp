const {Interaction, Client} = require("../models/models");
const {ApiError} = require('../error/ApiError')
class InteractionController {
    async create(req, res, next) {
        try {
            const { clientId, type, notes, date } = req.body;
            const interaction = await Interaction.create({ clientId, type, notes, date });
            res.status(201).json(interaction);
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async getByClient(req, res, next) {
        try {
            const interactions = await Interaction.findAll();
            res.json(interactions);
        } catch (error) {
            next(ApiError.internal());
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const rowsDeleted = await Interaction.destroy({ where: { id } });
            if (!rowsDeleted) return next(ApiError.badRequest('Клиент не найден'));
            res.status(204).send();
        } catch (error) {
            next(ApiError.internal());
        }
    }
}

module.exports = new InteractionController()