// workflow.model

const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        type: { type: DataTypes.STRING, allowNull: false },
        details: { type: DataTypes.JSON, allowNull: true },
        status: { 
            type: DataTypes.STRING, 
            allowNull: false
        },
        created: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        updated: { type: DataTypes.DATE }
    };

    const options = {
        timestamps: false
    };

    return sequelize.define('workflow', attributes, options);
}