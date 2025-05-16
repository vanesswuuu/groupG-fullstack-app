// department.service

const db = require('_helpers/db');

module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: _delete
};

async function getAll() {
    return await db.Department.findAll();
}

async function getById(id) {
    return await getDepartment(id);
}

async function create(params) {
    // validate
    if (await db.Department.findOne({ where: { name: params.name } })) {
        throw 'Department "' + params.name + '" already exists';
    }

    const department = new db.Department(params);
    await department.save();
    return department;
}

async function update(id, params) {
    const department = await getDepartment(id);

    // validate
    const nameChanged = params.name && department.name !== params.name;
    if (nameChanged && await db.Department.findOne({ where: { name: params.name } })) {
        throw 'Department "' + params.name + '" already exists';
    }

    Object.assign(department, params);
    department.updated = Date.now();
    await department.save();

    return department;
}

async function _delete(id) {
    const department = await getDepartment(id);
    await department.destroy();
}

// helper functions
async function getDepartment(id) {
    const department = await db.Department.findByPk(id);
    if (!department) throw 'Department not found';
    return department;
}