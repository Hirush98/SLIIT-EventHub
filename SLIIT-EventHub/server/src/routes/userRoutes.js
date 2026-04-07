const express = require('express');
const router = express.Router();
const { getAllOrganizers } = require('../controllers/userController');

// Public route to browse organizers
router.get('/organizers', getAllOrganizers);

module.exports = router;
