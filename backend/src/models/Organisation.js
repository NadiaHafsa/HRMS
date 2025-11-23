const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Organisation = sequelize.define('Organisation', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 255]
      }
    }
  }, {
    tableName: 'organisations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Organisation;
};