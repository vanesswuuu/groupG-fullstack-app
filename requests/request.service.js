// request.service

const db = require('_helpers/db');

module.exports = {
    create,
    getAll,
    getById,
    getByEmployee,
    update,
    delete: _delete
};

async function create(params) {
    // validate employee exists
    const employee = await db.Employee.findByPk(params.employeeId);
    if (!employee) throw 'Employee not found';

    const request = new db.Request(params);
    await request.save();

    // set association
    await request.setEmployee(params.employeeId);

    return request;
}

async function getAll() {
    return await db.Request.findAll({
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

async function getById(id) {
    return await getRequest(id);
}

async function getByEmployee(employeeId) {
    // validate employee exists
    const employee = await db.Employee.findByPk(employeeId);
    if (!employee) throw 'Employee not found';

    return await db.Request.findAll({ 
        where: { employeeId },
        include: [
            { model: db.Employee, attributes: ['id', 'employeeId'] }
        ]
    });
}

async function update(id, params) {
    const request = await getRequest(id);
    Object.assign(request, params);
    request.updated = Date.now();
    await request.save();
    return request;
}

async function _delete(id) {
    const request = await getRequest(id);
    await request.destroy();
}

// helper functions
async function getRequest(id) {
    const request = await db.Request.findByPk(id, {
        include: [
            { model: db.Employee, attributes: ['id', 'employeeId'] }
        ]
    });
    if (!request) throw 'Request not found';
    return request;
}