// backend/controllers/vesselController.js
const Vessel = require('../models/Vessel');
const simopsEngine = require('./simopsEngine');

exports.vesselHeartbeat = async (req, res) => {
  const { name, imoNumber, activePermits, lat, lng } = req.body; // Added lat/lng

  try {
    let [vessel, created] = await Vessel.findOrCreate({
      where: { imoNumber },
      defaults: { name, status: 'ONLINE', lat, lng }
    });

    vessel.status = 'ONLINE';
    vessel.activePermitCount = activePermits ? activePermits.length : 0;
    vessel.lastSync = new Date();
    
    // Update the position
    if (lat && lng) {
      vessel.lat = lat;
      vessel.lng = lng;
    }
    
    await vessel.save();

    // 3. Background Safety Check: Trigger SimOps engine for the reported permits
    // If a vessel is running 2 permits that conflict, the engine will fire an alert
    if (activePermits && activePermits.length > 1) {
      // Check the last permit against the others
      const latest = activePermits[activePermits.length - 1];
      const others = activePermits.slice(0, -1);
      await simopsEngine.checkConflicts(latest, name, others);
    }

    res.json({ 
      success: true, 
      message: created ? "Vessel Registered" : "Heartbeat Received",
      vesselId: vessel.id
    });
  } catch (error) {
    console.error('Heartbeat Error:', error);
    res.status(500).json({ error: "Failed to process vessel heartbeat" });
  }
};