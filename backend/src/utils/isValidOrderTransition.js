// backend/src/utils/isValidOrderTransition.js

// 👇 USAMOS REQUIRE EN LUGAR DE IMPORT
const { ORDER_TRANSITIONS } = require('../constants/orderTransitions.js');

const isValidOrderTransition = (currentStatus, newStatus) => {
  // 1. Si el estado es el mismo, es válido (idempotencia)
  if (currentStatus === newStatus) return true;

  // 2. Buscamos las transiciones permitidas
  const allowed = ORDER_TRANSITIONS[currentStatus];
  
  // 3. Validamos si existe la transición en la lista
  if (!allowed) return false; // El estado actual no existe
  
  return allowed.includes(newStatus);
};

module.exports = { isValidOrderTransition };