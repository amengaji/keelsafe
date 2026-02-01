// backend/controllers/templateController.js
const PermitTemplate = require('../models/PermitTemplate');

// Create or Update a Permit Template
exports.saveTemplate = async (req, res) => {
  const { name, description, category, checkpoints } = req.body;

  try {
    const [template, created] = await PermitTemplate.upsert({
      name,
      description,
      category,
      checkpoints
    });

    res.json({
      success: true,
      message: created ? "New Template Created" : "Template Updated",
      template
    });
  } catch (error) {
    console.error('Template Error:', error);
    res.status(500).json({ error: "Failed to save permit template" });
  }
};

// Fetch all templates for the Fleet Sync
exports.getAllTemplates = async (req, res) => {
  try {
    const templates = await PermitTemplate.findAll({ where: { isActive: true } });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch templates" });
  }
};