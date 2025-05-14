// request.model

const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        type: { type: DataTypes.STRING, allowNull: false },
        items: { type: DataTypes.JSON, allowNull: true },
        status: { 
            type: DataTypes.STRING, 
            allowNull: false, 
            defaultValue: 'pending' 
        },
        created: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        updated: { type: DataTypes.DATE }
    };

    const options = {
        timestamps: false
    };

    return sequelize.define('request', attributes, options);
}