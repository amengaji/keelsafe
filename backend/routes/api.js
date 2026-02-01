// backend/routes/api.js
const express = require('express');
const router = express.Router();
const notifController = require('../controllers/notificationController');
const simopsEngine = require('../controllers/simopsEngine');
const vesselController = require('../controllers/vesselController');
const templateController = require('../controllers/templateController');
const authController = require('../controllers/authController');
const permitController = require('../controllers/permitController');
const checklistController = require('../controllers/checklistController');
const ChecklistStep = require('../models/ChecklistStep');
const SimOpsRule = require('../models/SimOpsRule');
const simopsController = require('../controllers/simopsController');

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

router.post('/checklists/deploy', checklistController.deployChecklists);

router.post('/simops/rules/sync', simopsController.syncRules);


// Add a GET route to see all vessels (for your React Dashboard)
const Vessel = require('../models/Vessel');
// Updated GET route to provide full vessel details for the Web Dashboard
// backend/routes/api.js

router.get('/vessels', async (req, res) => {
  try {
    const fleet = await Vessel.findAll({ order: [['lastSync', 'DESC']] });
    
    // Clean the data to ensure the Frontend gets exactly what it needs
    const cleanFleet = fleet.map(v => ({
      id: v.id,
      name: v.name,
      imoNumber: v.imoNumber, // Ensure this matches your model
      status: v.status,
      lat: v.lat,
      lng: v.lng,
      activePermitCount: v.activePermitCount,
      lastSync: v.lastSync // This is the crucial field
    }));

    res.json(cleanFleet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add this route to your existing routes
router.get('/checklists/vessel-active', async (req, res) => {
  try {
    // Fetch all steps ordered by permit name and sequence
    const templates = await ChecklistStep.findAll({
      order: [
        ['permitName', 'ASC'],
        ['sequence', 'ASC']
      ]
    });

    // Send the array (even if empty)
    res.json(templates || []);
  } catch (error) {
    console.error("❌ Checklist Fetch Error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Internal Server Error while fetching checklists",
      details: error.message 
    });
  }
});

// Get all safety rules
router.get('/simops/rules', async (req, res) => {
  try {
    const rules = await SimOpsRule.findAll();
    res.json(rules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save a new conflict rule
router.post('/simops/rules', async (req, res) => {
  try {
    const rule = await SimOpsRule.create(req.body);
    res.json(rule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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