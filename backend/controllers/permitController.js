// backend/controllers/permitController.js
const Permit = require('../models/Permit');
const User = require('../models/User');

// 1. Initialize a new permit from a Template
exports.createPermit = async (req, res) => {
  const { vesselId, templateId, permitNumber } = req.body;
  try {
    const permit = await Permit.create({
      vesselId,
      templateId,
      permitNumber,
      status: 'DRAFT'
    });
    res.json({ success: true, permit });
  } catch (error) {
    res.status(500).json({ error: "Failed to initiate permit" });
  }
};

// 2. Crew Sign-on (For Fitters, Oilers, OS, etc. on Tablets)
exports.crewSignOn = async (req, res) => {
  const { permitId, userId } = req.body;
  try {
    const permit = await Permit.findByPk(permitId);
    const user = await User.findByPk(userId);

    if (!permit || !user) return res.status(404).json({ error: "Data not found" });

    // Append user to the JSONB signedCrew array
    const updatedCrew = [...permit.signedCrew, { 
      userId: user.id, 
      name: user.name, 
      rank: user.rank, 
      time: new Date() 
    }];

    await permit.update({ signedCrew: updatedCrew });
    res.json({ success: true, message: `${user.name} signed onto permit` });
  } catch (error) {
    res.status(500).json({ error: "Sign-on failed" });
  }
};

// 3. Final Authorization (For Master / Chief Eng / First Eng)
exports.authorizePermit = async (req, res) => {
  const { permitId, authorizerId } = req.body;
  try {
    const user = await User.findByPk(authorizerId);
    
    // Safety Gate: Check Rank
    const authorizedRanks = ['MASTER', 'CHIEF_OFFICER', 'CHIEF_ENGINEER', 'FIRST_ENGINEER'];
    if (!authorizedRanks.includes(user.rank)) {
      return res.status(403).json({ error: "Rank not authorized to sign permits" });
    }

    await Permit.update({ 
      status: 'ACTIVE', 
      authorizerId, 
      workStart: new Date() 
    }, { where: { id: permitId } });

    res.json({ success: true, message: "Permit Authorized. Work may commence." });
  } catch (error) {
    res.status(500).json({ error: "Authorization failed" });
  }
};