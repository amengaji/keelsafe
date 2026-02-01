const SimOpsRule = require('../models/SimOpsRule');
const sequelize = require('../config/db');

exports.syncRules = async (req, res) => {
  const { rules } = req.body; 

  if (!Array.isArray(rules)) {
    return res.status(400).json({ error: "Invalid ruleset provided." });
  }

  const t = await sequelize.transaction();

  try {
    // 1. Wipe old rules to ensure the Shore Console is the "Source of Truth"
    await SimOpsRule.destroy({ where: {}, transaction: t });

    // 2. Bulk Create new rules
    const formattedRules = rules.map(r => ({
      permitA: r.permitA,
      permitB: r.permitB,
      severity: r.severity.toUpperCase(),
      actionRequired: r.severity === 'forbidden' ? 'BLOCK' : 'OFFICE_AUTH'
    }));

    await SimOpsRule.bulkCreate(formattedRules, { transaction: t });

    await t.commit();
    res.json({ success: true, message: "SimOps Protocols Deployed to Fleet." });
  } catch (error) {
    if (t) await t.rollback();
    res.status(500).json({ error: error.message });
  }
};