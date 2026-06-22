const AddressService = require('../services/address.service');

const createAddress = async (req, res, next) => {
  try {
    const address = await AddressService.addAddress(req.user.id, req.body);
    res.status(201).json(address);
  } catch (error) {
    next(error);
  }
};

const getAddresses = async (req, res, next) => {
  try {
    const addresses = await AddressService.getUserAddresses(req.user.id);
    res.json(addresses);
  } catch (error) {
    next(error);
  }
};

const deleteAddress = async (req, res, next) => {
  try {
    await AddressService.deleteAddress(req.params.id, req.user.id);
    res.json({ message: 'Dirección eliminada' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createAddress, getAddresses, deleteAddress };