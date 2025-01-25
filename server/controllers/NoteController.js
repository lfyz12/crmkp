const {ApiError} = require('../error/ApiError')
const {Note} = require("../models/models");

class NoteController {
    async create(req, res, next) {
        try {
            const { clientId, content } = req.body;
            const note = await Note.create({ clientId, content });
            res.status(201).json(note);
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async getByClient(req, res, next) {
        try {
            const { clientId } = req.params;
            const notes = await Note.findAll({ where: { clientId } });
            res.json(notes);
        } catch (error) {
            next(ApiError.internal());
        }
    }
}

module.exports = new NoteController()