const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController')
const clientController = require('../controllers/ClientController')
const interactionController = require('../controllers/InteractionController')
const orderController = require('../controllers/OrderController')
const noteController = require('../controllers/NoteController')

// User Routes
router.post('/users/register', userController.register);
router.post('/users/login', userController.login);

// Client Routes
router.post('/clients', clientController.create);
router.get('/clients', clientController.getAll);
router.get('/clients/:id', clientController.getById);
router.delete('/clients/:id', clientController.delete);

// Interaction Routes
router.post('/interactions', interactionController.create);
router.get('/interactions/:clientId', interactionController.getByClient);

// Order Routes
router.post('/orders', orderController.create);
router.get('/orders/:clientId', orderController.getByClient);

// Note Routes
router.post('/notes', noteController.create);
router.get('/notes/:clientId', noteController.getByClient);

module.exports = router;