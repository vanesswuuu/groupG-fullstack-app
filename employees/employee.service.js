// employee.service

const db = require('_helpers/db');

module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: _delete,
    transfer
};

async function getAll() {
    return await db.Employee.findAll({
        include: [
            { model: db.Account, attributes: ['id', 'firstName', 'lastName', 'email'] },
            { model: db.Department, attributes: ['id', 'name'] }
        ]
    });
}

async function getById(id) {
    return await getEmployee(id);
}

async function create(params) {
    // validate
    if (await db.Employee.findOne({ where: { employeeId: params.employeeId } })) {
        throw 'Employee ID "' + params.employeeId + '" is already taken';
    }

    // validate account exists
    const account = await db.Account.findByPk(params.userId);
    if (!account) throw 'Account not found';

    // validate department exists if provided
    if (params.departmentId) {
        const department = await db.Department.findByPk(params.departmentId);
        if (!department) throw 'Department not found';
    }

    const employee = new db.Employee(params);
    await employee.save();

    // set associations
    if (params.userId) {
        await employee.setAccount(params.userId);
    }
    if (params.departmentId) {
        await employee.setDepartment(params.departmentId);
    }

    return employee;
}

async function update(id, params) {
    const employee = await getEmployee(id);

    // validate
    if (params.employeeId && employee.employeeId !== params.employeeId && 
        await db.Employee.findOne({ where: { employeeId: params.employeeId } })) {
        throw 'Employee ID "' + params.employeeId + '" is already taken';
    }

    Object.assign(employee, params);
    employee.updated = Date.now();
    await employee.save();

    // update associations if provided
    if (params.departmentId) {
        const department = await db.Department.findByPk(params.departmentId);
        if (!department) throw 'Department not found';
        await employee.setDepartment(params.departmentId);
    }

    return employee;
}

async function _delete(id) {
    const employee = await getEmployee(id);
    await employee.destroy();
}

async function transfer(id, departmentId) {
    const employee = await getEmployee(id);
    const department = await db.Department.findByPk(departmentId);
    if (!department) throw 'Department not found';

    employee.departmentId = departmentId;
    await employee.save();
    return employee;
}

// helper functions
async function getEmployee(id) {
    const employee = await db.Employee.findByPk(id, {
        include: [
            { model: db.Account, attributes: ['id', 'firstName', 'lastName', 'email'] },
            { model: db.Department, attributes: ['id', 'name'] }
        ]
    });
    if (!employee) throw 'Employee not found';
    return employee;
}