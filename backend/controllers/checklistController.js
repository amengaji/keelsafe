// backend/controllers/checklistController.js
const ChecklistStep = require('../models/ChecklistStep');
const sequelize = require('../config/db'); // Corrected to 'db'

exports.deployChecklists = async (req, res) => {
  const { steps } = req.body;

  if (!Array.isArray(steps) || steps.length === 0) {
    return res.status(400).json({ error: "No steps provided for deployment." });
  }

  const t = await sequelize.transaction();

  try {
    const updatedPermitNames = [...new Set(steps.map(s => s.permitName))];

    await ChecklistStep.destroy({
      where: { permitName: updatedPermitNames },
      transaction: t
    });

    const formattedSteps = steps.map((s, index) => ({
      permitName: s.permitName,
      category: s.category,
      sequence: index + 1,
      question: s.question,
      capsuleType: s.capsuleType,
      version: Date.now()
    }));

    await ChecklistStep.bulkCreate(formattedSteps, { transaction: t });

    await t.commit();
    
    res.json({ 
      success: true, 
      message: `Successfully deployed ${formattedSteps.length} steps to the fleet.` 
    });

  } catch (error) {
    if (t) await t.rollback(); // Corrected from .raw() to .rollback()
    console.error("Deployment Error:", error);
    res.status(500).json({ error: "Fleet deployment failed." });
  }
};