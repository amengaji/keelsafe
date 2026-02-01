// backend/models/Attachment.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Attachment = sequelize.define('Attachment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  permitId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  fileUrl: {
    type: DataTypes.STRING, // Link to where the photo is stored
    allowNull: false
  },
  caption: {
    type: DataTypes.STRING // e.g., "Atmosphere reading at 0900hrs"
  },
  uploadedBy: {
    type: DataTypes.STRING // Name/Rank of the person who took the photo
  }
}, {
  timestamps: true
});

module.exports = Attachment;