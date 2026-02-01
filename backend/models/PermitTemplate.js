// backend/models/PermitTemplate.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PermitTemplate = sequelize.define('PermitTemplate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true // e.g., "Hot Work"
  },
  description: {
    type: DataTypes.TEXT
  },
  category: {
    type: DataTypes.STRING, // e.g., "High Risk"
    defaultValue: 'General'
  },
  checkpoints: {
    type: DataTypes.JSONB, // Stores the array of Yes/No questions
    defaultValue: []
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true
});

module.exports = PermitTemplate;