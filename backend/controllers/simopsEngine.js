// backend/controllers/simopsEngine.js
const Notification = require('../models/Notification');

// Define Prohibited Combinations (Industry Standard)
const CONFLICT_RULES = [
  { p1: 'Hot Work', p2: 'Bunkering', msg: 'Fire risk near fuel transfer' },
  { p1: 'Hot Work', p2: 'Gas Freeing', msg: 'Explosive atmosphere risk' },
  { p1: 'Diving', p2: 'Engine Trial', msg: 'Personnel safety near thrusters' },
  { p1: 'Crane Ops', p2: 'Personnel Transfer', msg: 'Overhead load hazard' }
];

exports.checkConflicts = async (newPermitType, vesselName, activePermits) => {
  let conflicts = [];

  for (const active of activePermits) {
    const rule = CONFLICT_RULES.find(r => 
      (r.p1 === newPermitType && r.p2 === active) || 
      (r.p2 === newPermitType && r.p1 === active)
    );

    if (rule) {
      conflicts.push(rule.msg);
    }
  }

  if (conflicts.length > 0) {
    // Automatically trigger a Critical Notification in the DB
    await Notification.create({
      title: `SIMOPS CONFLICT: ${vesselName}`,
      message: `Prohibited activity detected: ${newPermitType} vs ${activePermits.join(', ')}. Reason: ${conflicts.join('; ')}`,
      category: 'CRITICAL',
      vesselName: vesselName
    });
    
    return { safe: false, reasons: conflicts };
  }

  return { safe: true };
};