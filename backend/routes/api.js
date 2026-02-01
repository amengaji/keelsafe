// backend/routes/api.js
const express = require('express');
const router = express.Router();
const notifController = require('../controllers/notificationController');
const simopsEngine = require('../controllers/simopsEngine');
const vesselController = require('../controllers/vesselController');
const templateController = require('../controllers/templateController');
const authController = require('../controllers/authController');
const permitController = require('../controllers/permitController');

// --- Auth Routes ---
router.post('/auth/login', authController.login);

/**
 * @section Notification Routes
 * Handles the shore-side alert feed
 */
router.get('/notifications', notifController.getFeed);
router.put('/notifications/:id/read', notifController.markAsRead);
// --- Vessel Fleet Routes ---
router.post('/vessels/heartbeat', vesselController.vesselHeartbeat);

// --- Permit Template Routes ---
router.post('/templates', templateController.saveTemplate);
router.get('/templates', templateController.getAllTemplates);

// --- Permit Lifecycle Routes ---
router.post('/permits/create', permitController.createPermit);
router.post('/permits/sign-on', permitController.crewSignOn);
router.post('/permits/authorize', permitController.authorizePermit);

router.post('/auth/register', authController.register);

// Add a GET route to see all vessels (for your React Dashboard)
const Vessel = require('../models/Vessel');
router.get('/vessels', async (req, res) => {
  const fleet = await Vessel.findAll({ order: [['lastSync', 'DESC']] });
  res.json(fleet);
});
/**
 * @section SimOps Engine Routes
 * Evaluates safety conflicts between multiple permits
 */
router.post('/simops/check', async (req, res) => {
  // 1. Guard against empty body (Prevents destructuring crashes)
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ 
      error: "Empty request body. Ensure Content-Type is set to application/json." 
    });
  }

  const { permitType, vesselName, activePermits } = req.body;

  // 2. Data Validation Guard
  if (!permitType || !vesselName || !Array.isArray(activePermits)) {
    return res.status(422).json({ 
      error: "Missing required fields. Required: permitType (string), vesselName (string), activePermits (array)." 
    });
  }

  // 3. Engine Execution
  try {
    const result = await simopsEngine.checkConflicts(permitType, vesselName, activePermits);
    res.json(result);
  } catch (error) {
    console.error('SimOps Engine Error:', error);
    res.status(500).json({ error: "Internal engine error during safety evaluation." });
  }
});

module.exports = router;