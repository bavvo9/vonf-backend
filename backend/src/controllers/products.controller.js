const ProductService = require('../services/products.service');
const { uploadImage } = require('../utils/cloudinary');
const fs = require('fs'); // Sistema de archivos para borrar la foto temporal
const AppError = require('../utils/appError');

const getProducts = async (req, res, next) => {
  try {
    const result = await ProductService.getAllProducts(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await ProductService.getProductById(Number(req.params.id));
    res.json(product);
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    let imageUrl = null;
    
    // 1. Si hay archivo, subimos a Cloudinary
    if (req.file) {
      imageUrl = await uploadImage(req.file.buffer);
      // 2. Borramos el archivo local temporal
      //fs.unlinkSync(req.file.path);
    }

    // Nota: Cuando usas 'form-data' en Postman, los números vienen como strings.
    // Es bueno convertirlos o dejar que Postgres lo intente.
    const productData = {
      ...req.body,
      image_url: imageUrl,
      price: Number(req.body.price),
      stock: req.body.stock? Number(req.body.stock):0,
      track_stock: req.body.track_stock === 'true', // Conversión manual de string a bool
      category_id: req.body.category_id ? Number(req.body.category_id) : null
    };

    const product = await ProductService.createProduct(productData);
    res.status(201).json(product);
  } catch (error) {
    // Si falla algo y quedó un archivo suelto, intentamos borrarlo
   // if (req.file && fs.existsSync(req.file.path)) {
     //  fs.unlinkSync(req.file.path);
    //}
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    let imageUrl = null;

    if (req.file) {
      imageUrl = await uploadImage(req.file.path);
      //fs.unlinkSync(req.file.path);
    }

    const productData = {
      ...req.body,
      // Solo sobreescribimos image_url si hay una nueva, si no, undefined (el modelo mantendrá la vieja)
      image_url: imageUrl || undefined 
    };
    
    // Convertir tipos si vienen en el body
    if (req.body.price) productData.price = Number(req.body.price);
    if (req.body.stock) productData.stock = Number(req.body.stock);
    if (req.body.track_stock) productData.track_stock = req.body.track_stock === 'true';

    const product = await ProductService.updateProduct(req.params.id, productData);
    res.json(product);
  } catch (error) {
    //if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const result = await ProductService.deleteProduct(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts, getProductById, createProduct, updateProduct, deleteProduct
};