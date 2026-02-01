// backend/routes/api.js
const express = require('express');
const router = express.Router();
const notifController = require('../controllers/notificationController');

// Check if controller functions exist to prevent crashing
if (notifController && notifController.getFeed) {
    router.get('/notifications', notifController.getFeed);
}

if (notifController && notifController.markAsRead) {
    router.put('/notifications/:id/read', notifController.markAsRead);
}

// THIS IS THE CRITICAL LINE
module.exports = router;