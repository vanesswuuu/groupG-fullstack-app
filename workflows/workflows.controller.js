// workflows.controller

const express = require('express');
const router = express.Router();
const authorize = require('_middleware/authorize');
const Role = require('_helpers/role');
const workflowService = require('./workflow.service');
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');

// routes
router.post('/', authorize(Role.Admin), createSchema, create);
router.get('/employee/:employeeId', authorize(), getByEmployee);
router.put('/:id/status', authorize(Role.Admin), updateStatusSchema, updateStatus);
router.post('/onboarding', authorize(Role.Admin), onboardingSchema, initiateOnboarding);

module.exports = router;

function createSchema(req, res, next) {
    const schema = Joi.object({
        employeeId: Joi.number().required(),
        type: Joi.string().required(),
        details: Joi.object().optional()
    });
    validateRequest(req, next, schema);
}

function create(req, res, next) {
    workflowService.create(req.body)
        .then(workflow => res.json(workflow))
        .catch(next);
}

function getByEmployee(req, res, next) {
    workflowService.getByEmployee(req.params.employeeId)
        .then(workflows => res.json(workflows))
        .catch(next);
}

function updateStatusSchema(req, res, next) {
    const schema = Joi.object({
        status: Joi.string().valid('pending', 'in-progress', 'completed', 'rejected').required()
    });
    validateRequest(req, next, schema);
}

function updateStatus(req, res, next) {
    workflowService.updateStatus(req.params.id, req.body.status)
        .then(workflow => res.json(workflow))
        .catch(next);
}

function onboardingSchema(req, res, next) {
    const schema = Joi.object({
        employeeId: Joi.number().required(),
        details: Joi.object().optional()
    });
    validateRequest(req, next, schema);
}

function initiateOnboarding(req, res, next) {
    workflowService.initiateOnboarding(req.body)
        .then(workflow => res.json(workflow))
        .catch(next);
}