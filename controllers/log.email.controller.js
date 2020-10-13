const express = require('express');
const router = express.Router();
const logEmailService = require('../services/log.email.service');

// routes
router.post('/table-log-email/', getTable);
module.exports = router;

/**
 * POST getTable
 */
function getTable(req, res, next) {
    logEmailService.dataTable(req.body)
        .then(logEmails => logEmails ? res.json(logEmails) : res.status(400).json({ message: 'No hay información disponibe' }))
        .catch(err => next(err));
}