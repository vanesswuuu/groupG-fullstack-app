const config = require('config.json');
const { Sequelize } = require('sequelize');

module.exports = db = {};

initialize();

async function initialize() {
    // Get database config
    const { host, port, user, password, database, ssl } = config.database;

    // Create a Sequelize instance
    const sequelize = new Sequelize(config.database.url, {
        dialect: 'postgres',
        dialectOptions: {
            ssl: config.database.ssl ? {
                require: true,
                rejectUnauthorized: false,
            } : false
        },
        logging: console.log  // Enable logging to see connection attempts
    });

    try {
        // Test the connection
        await sequelize.authenticate();
        console.log("PostgreSQL connection established successfully.");

        // Init models and add them to the exported db object
        db.Account = require('../accounts/account.model')(sequelize);
        db.RefreshToken = require('../accounts/refresh-token.model')(sequelize);

        // Define relationships
        db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
        db.RefreshToken.belongsTo(db.Account);

        // Sync all models with database
        await sequelize.sync({ alter: true });
        console.log("Database synced successfully.");
    } catch (error) {
        console.error("Unable to connect to the PostgreSQL database:", error);
    }
}
