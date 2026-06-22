const OrderService = require('../services/order.service');

const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // 👇 1. Recibimos exactamente lo que manda el Frontend (SnakeCase)
    const { address_id, payment_method } = req.body; 

    // 👇 2. Validaciones básicas (Ya NO validamos items aquí, lo hace el service)
    if (!address_id) {
      return res.status(400).json({ message: 'Debes seleccionar una dirección de envío' });
    }

    if (!payment_method || !['mercadopago', 'transfer'].includes(payment_method)) {
       return res.status(400).json({ message: 'Método de pago inválido' });
    }

    // 👇 3. Llamada al Servicio (Solo con los 3 datos que necesita)
    // El servicio se encarga de buscar el carrito, validar stock y calcular total.
    const result = await OrderService.createOrder(userId, address_id, payment_method);
    
    // 👇 4. Respuesta Exitosa
    if (payment_method === 'transfer') {
        return res.status(201).json({
            message: 'Orden creada. Esperando transferencia.',
            orderId: result.uuid, // Usamos el UUID para mostrar el recibo
            total: result.total,
            bankInfo: { 
                cbu: '0000003100000000000000',
                alias: 'VONF.NEON.MP',
                bank: 'Mercado Pago',
                holder: 'Tobias (Tesorero)'
            }
        });
    }

    // Caso MercadoPago (Futuro)
    res.status(201).json(result);
    
  } catch (error) {
    next(error); // Si el servicio dice "Carrito vacío", el error caerá aquí y devolverá 400
  }
};


/*const getOrderById = async (req, res, next) => {
  try {
    const order = await OrderService.getOrderById(req.params.id, req.user.id, req.user.role);
    res.json(order);
  } catch (error) {
    next(error);
  }
};*/

// Nuevo endpoint para ver orden por UUID
// ✅ ESTA ES LA FUNCIÓN PARA OBTENER ORDEN (Usando UUID)
const getOrder = async (req, res, next) => {
  try {
    const { uuid } = req.params; // 1. Recibimos el UUID de la URL

    // 2. Busamos la orden
    const order = await OrderService.getOrderByUuid(uuid);

    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    // 3. Seguridad: Solo el dueño o el admin pueden verla
    // Nota: Asegúrate de que tu modelo devuelva 'user_id' para poder comparar
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado para ver esta orden' });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

const getOrderHistory = async (req, res, next) => {
  try {
    const history = await OrderService.getOrderHistory(req.params.id, req.user.id, req.user.role);
    res.json(history);
  } catch (error) {
    next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const result = await OrderService.cancelOrder(req.params.id, req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};


const getOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // 👇 CAMBIO: Siempre devolvemos las órdenes del usuario, aunque sea admin.
    // Esto arregla el bug de "No veo mis órdenes en el perfil".
    const orders = await OrderService.getOrdersByUser(userId);
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// 2. Nuevo método (Para el Panel Admin)
const getAllOrdersAdmin = async (req, res, next) => {
  try {
    const orders = await OrderService.getAllOrdersWithDetails();
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await OrderService.adminUpdateStatus(
      req.params.id,
      req.body.status,
      req.user.id
    );
    res.json({ message: 'Estado actualizado', order });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  createOrder, getOrder, cancelOrder, getOrderHistory, getOrders, updateOrderStatus, getAllOrdersAdmin
};