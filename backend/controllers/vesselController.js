// backend/controllers/vesselController.js
const Vessel = require('../models/Vessel');
const simopsEngine = require('./simopsEngine');

/**
 * vesselHeartbeat
 * Receives live telemetry from the ship's mobile app.
 * Updates position, status, and triggers SimOps conflict checks.
 */
exports.vesselHeartbeat = async (req, res) => {
  // Destructure with default values to prevent undefined crashes
  const { name, imoNumber, activePermits, lat, lng } = req.body;

  // --- 1. VALIDATION GUARD ---
  // This prevents the "WHERE parameter invalid undefined" error
  if (!imoNumber) {
    console.error('Heartbeat Rejected: Missing imoNumber in request body');
    return res.status(400).json({ 
      success: false, 
      error: "imoNumber is required to identify the vessel." 
    });
  }

  try {
    // --- 2. DATABASE SYNC ---
    // Use findOrCreate to handle new vessels or existing ones
    let [vessel, created] = await Vessel.findOrCreate({
      where: { imoNumber: imoNumber },
      defaults: { 
        name: name || "Unknown Vessel", 
        status: 'ONLINE', 
        lat: lat || 0, 
        lng: lng || 0 
      }
    });

    // Update operational metadata
    vessel.status = 'ONLINE';
    vessel.activePermitCount = Array.isArray(activePermits) ? activePermits.length : 0;
    vessel.lastSync = new Date();
    
    // Update geo-position if provided
    if (lat !== undefined && lng !== undefined) {
      vessel.lat = lat;
      vessel.lng = lng;
    }
    
    // Save all changes to PostgreSQL
    await vessel.save();

    // --- 3. SIMOPS CONFLICT ENGINE ---
    // If multiple permits are active, evaluate for safety violations
    if (Array.isArray(activePermits) && activePermits.length > 1) {
      try {
        const latest = activePermits[activePermits.length - 1];
        const others = activePermits.slice(0, -1);
        
        // Non-blocking conflict check
        await simopsEngine.checkConflicts(latest, vessel.name, others);
      } catch (simError) {
        console.error('SimOps Engine Error (Non-Fatal):', simError.message);
      }
    }

    // --- 4. RESPONSE ---
    res.json({ 
      success: true, 
      message: created ? "Vessel Registered" : "Heartbeat Received",
      vessel: {
        id: vessel.id,
        name: vessel.name,
        lastSync: vessel.lastSync
      }
    });

  } catch (error) {
    // Global catch to prevent server hanging
    console.error('Heartbeat Logic Error:', error);
    res.status(500).json({ 
      success: false, 
      error: "Internal server error during heartbeat processing" 
    });
  }
};