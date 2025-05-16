// workflow.service

const db = require('_helpers/db');

module.exports = {
    create,
    getByEmployee,
    updateStatus,
    initiateOnboarding
};

async function create(params) {
    console.log('Received workflow creation params:', {
        type: params.type,
        status: params.status,
        details: params.details,
        employeeId: params.employeeId,
        fullParams: params // This will log the complete params object
    });

    // validate employee exists
    const employee = await db.Employee.findByPk(params.employeeId);
    if (!employee) {
        console.error(`Employee not found with ID: ${params.employeeId}`);
        throw 'Employee not found';
    }

    console.log(`Found employee: ${employee.id} - ${employee.name}`);

    const workflow = db.Workflow.build({
        type: params.type,
        status: params.status,
        details: params.details || null,
        employeeId: params.employeeId
    });
    
    console.log('Workflow object before save:', workflow.toJSON());
    
    await workflow.save();
    console.log('Workflow saved successfully with ID:', workflow.id);

    // set association
    await workflow.setEmployee(params.employeeId);
    console.log('Employee association set for workflow');

    return workflow;
}

async function getByEmployee(employeeId) {
    // validate employee exists
    const employee = await db.Employee.findByPk(employeeId);
    if (!employee) throw 'Employee not found';

    return await db.Workflow.findAll({ 
        where: { employeeId },
        include: [{ 
            model: db.Employee, 
            attributes: ['id', 'employeeId'],
            include: [{
                model: db.Account,
                attributes: ['firstName', 'lastName', 'email']
            }]
        }]
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