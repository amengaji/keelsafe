// backend/models/Permit.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Permit = sequelize.define('Permit', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  vesselId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  templateId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  permitNumber: {
    type: DataTypes.STRING, // e.g., "HW-2026-001"
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('DRAFT', 'PENDING_AUTH', 'ACTIVE', 'COMPLETED', 'CANCELLED'),
    defaultValue: 'DRAFT'
  },
  // We store the IDs of the crew members currently signed onto the permit
  signedCrew: {
    type: DataTypes.JSONB, 
    defaultValue: [] // Array of { userId: 'uuid', rank: 'OS', signOnTime: 'date' }
  },
  authorizerId: {
    type: DataTypes.UUID, // Link to Master/Chief Eng/First Eng
    allowNull: true
  },
  workStart: {
    type: DataTypes.DATE,
    allowNull: true
  },
  workEnd: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = Permit;