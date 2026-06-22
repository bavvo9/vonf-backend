const ProductModel = require('../models/products.model');
const AppError = require('../utils/appError');

const getAllProducts = async (query) => {
  const minPrice = query.minPrice ? Number(query.minPrice) : null;
  const maxPrice = query.maxPrice ? Number(query.maxPrice) : null;
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const offset = (page - 1) * limit;
  const sort = query.sort;
  const order = query.order === 'desc' ? 'DESC' : 'ASC';
  const category = query.category_id;
  const featured = query.is_featured;

  //Extraemos la búsqueda
  const search = query.search;

  const { total, results } = await ProductModel.findAll({
    minPrice, maxPrice, sort, order, limit, offset, search, featured, category
  });

  return { page, limit, total, results, category };
};

const getProductById = async (id) => {
  const product = await ProductModel.findById(id);
  if (!product) throw new AppError('Producto no encontrado', 404);
  return product;
};

const createProduct = async (data) => {
  if (!data.name || !data.price) throw new AppError('Nombre y precio son obligatorios', 400);
  
  return await ProductModel.create({
      name: data.name,
      description: data.description,
      price: data.price,
      stock: data.stock,
      track_stock: data.track_stock,
      image_url: data.image_url // 👈 Pasamos la URL
  });
};

const updateProduct = async (id, data) => {
  const current = await ProductModel.findById(id);
  if (!current) throw new AppError('Producto no encontrado', 404);

  return await ProductModel.update(id, current, {
      name: data.name,
      description: data.description,
      price: data.price,
      stock: data.stock,
      track_stock: data.track_stock,
      image_url: data.image_url, // 👈 Pasamos la URL
      is_featured: data.is_featured,
      is_active:data.is_active
  });
};

const deleteProduct = async (id) => {
  const deleted = await ProductModel.deleteById(id);
  if (!deleted) throw new AppError('Producto no encontrado', 404);
  return { message: 'Producto eliminado correctamente' };
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };