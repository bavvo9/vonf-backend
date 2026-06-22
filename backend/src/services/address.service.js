const AddressModel = require('../models/address.model');
const AppError = require('../utils/appError');

const addAddress = async (userId, data) => {
  // 👇 Validación estricta
  
  if (!data.street || !data.city ||!data.state || !data.zipCode || !data.phone) {
    throw new AppError('Calle, Ciudad, CP y Teléfono son obligatorios', 400);
  }
  return await AddressModel.create({ ...data, userId });
};

const getUserAddresses = async (userId) => {
  return await AddressModel.findAllByUserId(userId);
};

const deleteAddress = async (id, userId) => {
  const address = await AddressModel.findById(id);
  if (!address) throw new AppError('Dirección no encontrada', 404);
  
  if (address.user_id !== userId) throw new AppError('No autorizado', 403);

  await AddressModel.deleteById(id);
};

module.exports = { addAddress, getUserAddresses, deleteAddress };