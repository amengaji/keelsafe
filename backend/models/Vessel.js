// backend/models/Vessel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Vessel = sequelize.define('Vessel', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  imoNumber: {
    type: DataTypes.STRING,
    unique: true
  },
  status: {
    type: DataTypes.ENUM('ONLINE', 'OFFLINE', 'SYNCING'),
    defaultValue: 'OFFLINE'
  },
  activePermitCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastSync: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  lat: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  lng: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = Vessel;