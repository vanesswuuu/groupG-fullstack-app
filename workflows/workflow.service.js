// workflow.service

const db = require('_helpers/db');

module.exports = {
    create,
    getByEmployee,
    updateStatus,
    initiateOnboarding
};

async function create(params) {
    // validate employee exists
    const employee = await db.Employee.findByPk(params.employeeId);
    if (!employee) throw 'Employee not found';

    const workflow = new db.Workflow(params);
    await workflow.save();

    // set association
    await workflow.setEmployee(params.employeeId);

    return workflow;
}

async function getByEmployee(employeeId) {
    // validate employee exists
    const employee = await db.Employee.findByPk(employeeId);
    if (!employee) throw 'Employee not found';

    return await db.Workflow.findAll({ 
        where: { employeeId },
        include: [
            { model: db.Employee, attributes: ['id', 'employeeId'] }
        ]
    });
}

async function updateStatus(id, status) {
    const workflow = await getWorkflow(id);
    workflow.status = status;
    workflow.updated = Date.now();
    await workflow.save();
    return workflow;
}

async function initiateOnboarding(params) {
    // validate employee exists
    const employee = await db.Employee.findByPk(params.employeeId);
    if (!employee) throw 'Employee not found';

    // create onboarding workflow
    const workflow = new db.Workflow({
        type: 'Onboarding',
        details: params.details || {},
        employeeId: params.employeeId
    });
    await workflow.save();

    return workflow;
}

// helper functions
async function getWorkflow(id) {
    const workflow = await db.Workflow.findByPk(id, {
        include: [
            { model: db.Employee, attributes: ['id', 'employeeId'] }
        ]
    });
    if (!workflow) throw 'Workflow not found';
    return workflow;
}