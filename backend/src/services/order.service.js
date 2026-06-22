const pool = require('../db/index.js');
const OrderModel = require('../models/order.model');
const CartModel = require('../models/cart.model');
const ProductModel = require('../models/products.model');
const AddressModel = require('../models/address.model');
const AppError = require('../utils/appError');
const { isValidOrderTransition } = require('../utils/isValidOrderTransition');

const createOrder = async (userId, addressId, paymentMethod) => {
  // Validar Dirección
  if (!addressId) throw new AppError('Debes seleccionar una dirección de envío', 400);
  
  const address = await AddressModel.findById(addressId);
  if (!address) throw new AppError('Dirección no encontrada', 404);
  if (address.user_id !== userId) throw new AppError('Dirección inválida', 403);

  const client = await pool.connect(); 
  try {
    await client.query('BEGIN'); 

    // A. Obtener carrito (CORREGIDO: Pasamos userId)
    // 👇 AQUÍ ESTABA EL ERROR: Faltaba pasar userId
    const cartItems = await CartModel.getCartItems(userId);
    
    if (!cartItems || cartItems.length === 0) {
      throw new AppError('El carrito está vacío', 400);
    }

    // 👇 DEBUG: Ver qué diablos está trayendo la base de datos
    console.log("🛒 PROCESANDO ORDEN - ITEMS:", cartItems);

    // B. Validar Stock y Calcular Total
    let total = 0;
    for (const item of cartItems) {
      // 👇 FIX 1: Detectamos el ID sea cual sea el nombre ('id' o 'product_id')

      // 👇 FIX 2: Usamos los datos que YA vienen del carrito (Optimización: 0 consultas extra)
      // Aseguramos que sean números para evitar errores matemáticos
      const stock = Number(item.stock);
      const price = Number(item.price);
      
      if (item.track_stock && item.quantity > stock) {
        throw new AppError(`Stock insuficiente para ${item.name}. Disponible: ${stock}`, 400);
      }
      
      total += price * item.quantity;
    }

    // C. Crear la Orden
    const order = await OrderModel.createOrder(total, userId, addressId, paymentMethod, client);

    // D. Procesar Items y Descontar Stock
    for (const item of cartItems) {
      await OrderModel.createOrderItem({
        orderId: order.id,
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }, client);

      const product = await ProductModel.findById(item.id);
      if (product.track_stock) {
        await ProductModel.decreaseStock(item.id, item.quantity, client);
      }
    }

    // E. Vaciar Carrito (CORREGIDO: Pasamos userId para borrar SOLO el de este usuario)
    await CartModel.clearCart(userId, client);

    // F. Registrar Historial
    await OrderModel.logStatusHistory({
      orderId: order.id,
      previousStatus: null,
      newStatus: 'pending',
      changedBy: userId,
      role: 'user'
    }, client);

    await client.query('COMMIT'); 
    return { message: 'Orden creada correctamente', order_id: order.id, uuid: order.uuid, total };

  } catch (error) {
    await client.query('ROLLBACK'); 
    throw error;
  } finally {
    client.release(); 
  }
};



const getOrderById = async (id, userId, userRole) => {
  const order = await OrderModel.findById(id);
  if (!order) throw new AppError('Orden no encontrada', 404);

  if (userRole !== 'admin' && order.user_id !== userId) {
    throw new AppError('No autorizado', 403);
  }

  return order;
};

const getAllOrdersWithDetails = async () => {
  return await OrderModel.findAllWithDetails();
};

const getOrdersByUser = async (userId) => {
  return await OrderModel.findByUserId(userId);
};

const getOrderByUuid = async (uuid) => {
    // Si tu modelo OrderModel tiene findByUuid úsalo, si no, usa findById o crea la función
    // Asumiendo que existe o usas findById por ahora si uuid es el id
    const order = await OrderModel.findByUuid(uuid); 
    if (!order) throw new AppError('Orden no encontrada', 404);
    return order;
};

const getOrderHistory = async (id, userId, userRole) => {
  await getOrderById(id, userId, userRole);
  return await OrderModel.getHistory(id);
};

const cancelOrder = async (id, userId) => {
  const order = await OrderModel.findById(id);
  if (!order) throw new AppError('Orden no encontrada', 404);

  if (order.user_id !== userId) throw new AppError('No podés cancelar esta orden', 403);
  if (order.status !== 'pending') throw new AppError('Solo se pueden cancelar órdenes pendientes', 400);

  await OrderModel.updateStatus(id, 'cancelled');
  return { message: 'Orden cancelada correctamente' };
};

const getAllOrders = async () => {
  return await OrderModel.findAll();
};

const adminUpdateStatus = async (id, newStatus, adminId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const order = await OrderModel.findById(id);
    if (!order) throw new AppError('Orden no encontrada', 404);

    if (!isValidOrderTransition(order.status, newStatus)) {
      throw new AppError(`No se puede cambiar de ${order.status} a ${newStatus}`, 400);
    }

    const updatedOrder = await OrderModel.updateStatus(id, newStatus, client);
    
    await OrderModel.logStatusHistory({
      orderId: id,
      previousStatus: order.status,
      newStatus,
      changedBy: adminId,
      role: 'admin'
    }, client);

    await client.query('COMMIT');
    return updatedOrder;

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getOrderByUuid,
  getOrderHistory,
  cancelOrder,
  getAllOrders,
  adminUpdateStatus,
  getOrdersByUser,
  getAllOrdersWithDetails
};