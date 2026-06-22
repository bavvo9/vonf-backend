const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const { createAddress, getAddresses, deleteAddress } = require('../controllers/address.controller');

router.use(authMiddleware);

router.post('/', createAddress);
router.get('/', getAddresses);
router.delete('/:id', deleteAddress);

module.exports = router;