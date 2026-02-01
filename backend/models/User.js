// backend/models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true, // Optional for deck crew who use Employee IDs
    unique: true
  },
  employeeId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // 4-digit PIN for quick tablet sign-offs
  pin: {
    type: DataTypes.STRING,
    allowNull: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
    rank: {
    type: DataTypes.ENUM(
        'MASTER', 'CHIEF_OFFICER', 'CHIEF_ENGINEER', 'FIRST_ENGINEER', 
        'BOSUN', 'FITTER', 'PUMPMAN', 'AB', 'OS', 'OILER', 'WIPER', 
        'COOK', 'STEWARD', 'DPA', 'ADMIN'
    ),
    allowNull: false
    },
  vesselId: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  hooks: {
    beforeCreate: async (user) => {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
      if (user.pin) {
        user.pin = await bcrypt.hash(user.pin, salt);
      }
    }
  }
});

module.exports = User;