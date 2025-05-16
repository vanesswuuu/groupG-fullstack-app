// employees.controller

const express = require('express');
const router = express.Router();
const authorize = require('_middleware/authorize');
const Role = require('_helpers/role');
const employeeService = require('./employee.service');
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');

// routes
router.post('/', authorize(Role.Admin), createSchema, create);
router.get('/', authorize(), getAll);
router.get('/:id', authorize(), getById);
router.put('/:id', authorize(Role.Admin), updateSchema, update);
router.delete('/:id', authorize(Role.Admin), _delete);
router.post('/:id/transfer', authorize(Role.Admin), transferSchema, transfer);

module.exports = router;

function createSchema(req, res, next) {
    const schema = Joi.object({
        employeeId: Joi.string().required(),
        userId: Joi.number().required(),
        position: Joi.string().required(),
        hireDate: Joi.date().required(),
        departmentId: Joi.number().required()
    });
    validateRequest(req, next, schema);
}

function create(req, res, next) {
    employeeService.create(req.body)
        .then(employee => res.json(employee))
        .catch(next);
}

function getAll(req, res, next) {
    employeeService.getAll()
        .then(employees => res.json(employees))
        .catch(next);
}

function getById(req, res, next) {
    employeeService.getById(req.params.id)
        .then(employee => employee ? res.json(employee) : res.sendStatus(404))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        employeeId: Joi.string().empty(''),
        position: Joi.string().empty(''),
        hireDate: Joi.date().empty(''),
        departmentId: Joi.number().empty(''),
        status: Joi.string().valid('active', 'inactive').empty('')
    });
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    employeeService.update(req.params.id, req.body)
        .then(employee => res.json(employee))
        .catch(next);
}

function _delete(req, res, next) {
    employeeService.delete(req.params.id)
        .then(() => res.json({ message: 'Employee deleted successfully' }))
        .catch(next);
}

function transferSchema(req, res, next) {
    const schema = Joi.object({
        departmentId: Joi.number().required()
    });
    validateRequest(req, next, schema);
}

function transfer(req, res, next) {
    employeeService.transfer(req.params.id, req.body.departmentId)
        .then(employee => res.json(employee))
        .catch(next);
}