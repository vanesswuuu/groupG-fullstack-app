// employee.model

const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        employeeId: { type: DataTypes.STRING, allowNull: false, unique: true },
        position: { type: DataTypes.STRING, allowNull: false },
        hireDate: { type: DataTypes.DATEONLY, allowNull: false },
        created: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        updated: { type: DataTypes.DATE },
        status: { 
            type: DataTypes.STRING, 
            allowNull: false, 
            defaultValue: 'active' 
        }
    };

    const options = {
        timestamps: false
    };

    return sequelize.define('employee', attributes, options);
}