const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool
  }
);

// Import models
const Organisation = require('./Organisation')(sequelize);
const User = require('./User')(sequelize);
const Employee = require('./Employee')(sequelize);
const Team = require('./Team')(sequelize);
const Log = require('./Log')(sequelize);

// Define associations
Organisation.hasMany(User, { foreignKey: 'organisation_id', onDelete: 'CASCADE' });
User.belongsTo(Organisation, { foreignKey: 'organisation_id' });

Organisation.hasMany(Employee, { foreignKey: 'organisation_id', onDelete: 'CASCADE' });
Employee.belongsTo(Organisation, { foreignKey: 'organisation_id' });

Organisation.hasMany(Team, { foreignKey: 'organisation_id', onDelete: 'CASCADE' });
Team.belongsTo(Organisation, { foreignKey: 'organisation_id' });

// Many-to-many relationship between Employee and Team
Employee.belongsToMany(Team, { 
  through: 'employee_teams',
  foreignKey: 'employee_id',
  otherKey: 'team_id',
  onDelete: 'CASCADE'
});

Team.belongsToMany(Employee, { 
  through: 'employee_teams',
  foreignKey: 'team_id',
  otherKey: 'employee_id',
  onDelete: 'CASCADE'
});

Organisation.hasMany(Log, { foreignKey: 'organisation_id', onDelete: 'CASCADE' });
Log.belongsTo(Organisation, { foreignKey: 'organisation_id' });

User.hasMany(Log, { foreignKey: 'user_id', onDelete: 'SET NULL' });
Log.belongsTo(User, { foreignKey: 'user_id' });

// Sync database
const syncDatabase = async () => {
  try {
    console.log('🔄 Attempting to connect to database...');
    console.log('📊 Database:', dbConfig.database);
    
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    await sequelize.sync({ alter: true });
    console.log('✅ All models synchronized successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:');
    console.error('Error:', error.message);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  Organisation,
  User,
  Employee,
  Team,
  Log,
  syncDatabase
};