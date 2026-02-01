// backend/models/ChecklistStep.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Corrected from 'database' to 'db'

const ChecklistStep = sequelize.define('ChecklistStep', {
  permitName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: 'general'
  },
  sequence: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  question: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  capsuleType: {
    type: DataTypes.STRING,
    defaultValue: 'YN'
  },
  version: {
    type: DataTypes.BIGINT, // Using BigInt for timestamps
    defaultValue: Date.now()
  }
});

module.exports = ChecklistStep;