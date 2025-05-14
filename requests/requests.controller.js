// requests.controller

const express = require('express');
const router = express.Router();
const authorize = require('_middleware/authorize');
const Role = require('_helpers/role');
const requestService = require('./request.service');
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');

// routes
router.post('/', authorize(), createSchema, create);
router.get('/', authorize(Role.Admin), getAll);
router.get('/:id', authorize(), getById);
router.get('/employee/:employeeId', authorize(), getByEmployee);
router.put('/:id', authorize(Role.Admin), updateSchema, update);
router.delete('/:id', authorize(Role.Admin), _delete);

module.exports = router;

function createSchema(req, res, next) {
    const schema = Joi.object({
        employeeId: Joi.number().required(),
        type: Joi.string().required(),
        items: Joi.array().items(Joi.object({
            name: Joi.string().required(),
            quantity: Joi.number().integer().min(1).required()
        })).optional()
    });
    validateRequest(req, next, schema);
}

function create(req, res, next) {
    requestService.create(req.body)
        .then(request => res.json(request))
        .catch(next);
}

function getAll(req, res, next) {
    requestService.getAll()
        .then(requests => res.json(requests))
        .catch(next);
}

function getById(req, res, next) {
    requestService.getById(req.params.id)
        .then(request => request ? res.json(request) : res.sendStatus(404))
        .catch(next);
}

function getByEmployee(req, res, next) {
    // users can get their own requests and admins can get any
    if (Number(req.params.employeeId) !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    requestService.getByEmployee(req.params.employeeId)
        .then(requests => res.json(requests))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        status: Joi.string().valid('pending', 'approved', 'rejected', 'fulfilled').required(),
        items: Joi.array().items(Joi.object({
            name: Joi.string().required(),
            quantity: Joi.number().integer().min(1).required()
        })).optional()
    });
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    requestService.update(req.params.id, req.body)
        .then(request => res.json(request))
        .catch(next);
}

function _delete(req, res, next) {
    requestService.delete(req.params.id)
        .then(() => res.json({ message: 'Request deleted successfully' }))
        .catch(next);
}