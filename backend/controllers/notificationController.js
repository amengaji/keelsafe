const Notification = require('../models/Notification');

exports.getFeed = async (req, res) => {
  try {
    const feed = await Notification.findAll({ limit: 20, order: [['createdAt', 'DESC']] });
    res.json(feed);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notification feed' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await Notification.update({ isRead: true }, { where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notification status' });
  }
};