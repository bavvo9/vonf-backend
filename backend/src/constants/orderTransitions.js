// backend/src/constants/orderTransitions.js

const ORDER_TRANSITIONS = {
  pending: ['paid', 'cancelled'],
  paid: ['shipped', 'delivered', 'cancelled', 'pending'], // Flexible para Admin
  shipped: ['delivered', 'cancelled', 'paid'],
  delivered: ['shipped', 'paid'], // Flexible por si hay error
  cancelled: ['pending']
};

// 👇 AGREGADO: Definimos el estado inicial por defecto
const initialStatus = 'pending';

module.exports = {
  ORDER_TRANSITIONS,
  initialStatus // 👈 ¡Esto faltaba exportar!
};