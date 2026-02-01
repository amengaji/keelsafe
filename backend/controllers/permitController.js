// backend/controllers/permitController.js
const Permit = require('../models/Permit');
const SimOpsRule = require('../models/SimOpsRule');
const { Op } = require('sequelize');

/**
 * checkSimOpsConflict
 * Middleware to check for SimOps violations before creating or activating a permit.
 * Checks Vessel + Zone + WorkType against active permits and Shore-defined rules.
 */
exports.checkSimOpsConflict = async (req, res, next) => {
  const { vesselId, workType, zone } = req.body;

  try {
    // 1. Fetch all currently ACTIVE permits on this specific vessel in the same zone
    const activePermits = await Permit.findAll({
      where: {
        vesselId: vesselId,
        status: 'ACTIVE',
        zone: zone 
      }
    });

    // If no other permits are active in that zone, there is no conflict
    if (activePermits.length === 0) {
      return next();
    }

    // 2. Fetch all CRITICAL/FORBIDDEN SimOps rules from the database
    const rules = await SimOpsRule.findAll({ 
      where: { 
        severity: 'CRITICAL' 
      } 
    });

    // 3. Cross-reference the requested workType against active permits
    for (const activePermit of activePermits) {
      const conflict = rules.find(r => 
        (r.permitA === workType && r.permitB === activePermit.workType) ||
        (r.permitA === activePermit.workType && r.permitB === workType)
      );

      if (conflict) {
        return res.status(409).json({
          success: false,
          conflict: true,
          message: `SIMOPS VIOLATION: ${workType.toUpperCase()} is forbidden in ${zone} while ${activePermit.workType.toUpperCase()} is ongoing.`,
          activePermitId: activePermit.id,
          vesselId: vesselId
        });
      }
    }

    // No conflicts found, move to the next function in the route
    next();
  } catch (error) {
    console.error("SimOps Validation Error:", error);
    res.status(500).json({ error: "Internal Safety Engine Error" });
  }
};

/**
 * createPermit
 * Handles the final creation of the permit after safety checks pass.
 */
exports.createPermit = async (req, res) => {
  try {
    const permit = await Permit.create({
      ...req.body,
      status: 'PENDING', // Default to pending until signed
      version: Date.now()
    });

    res.status(201).json({
      success: true,
      data: permit
    });
  } catch (error) {
    console.error("Permit Creation Error:", error);
    res.status(500).json({ error: "Failed to create permit" });
  }
};

/**
 * getVesselPermits
 * Fetches all permits for a specific vessel.
 */
exports.getVesselPermits = async (req, res) => {
  try {
    const permits = await Permit.findAll({
      where: { vesselId: req.params.vesselId },
      order: [['createdAt', 'DESC']]
    });
    res.json(permits);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch permits" });
  }
};