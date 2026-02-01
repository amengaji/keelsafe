const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SimOpsRule = sequelize.define('SimOpsRule', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  permitA: {
    type: DataTypes.STRING,
    allowNull: false
  },
  permitB: {
    type: DataTypes.STRING,
    allowNull: false
  },
  severity: {
    type: DataTypes.ENUM('CRITICAL', 'WARNING'),
    defaultValue: 'CRITICAL'
  },
  actionRequired: {
    type: DataTypes.STRING,
    defaultValue: 'BLOCK_AUTHORIZATION'
  }
});

module.exports = SimOpsRule;