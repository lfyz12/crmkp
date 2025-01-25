const {Interaction} = require("../models/models");
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
            const { clientId } = req.params;
            const interactions = await Interaction.findAll({ where: { clientId } });
            res.json(interactions);
        } catch (error) {
            next(ApiError.internal());
        }
    }
}

module.exports = new InteractionController()