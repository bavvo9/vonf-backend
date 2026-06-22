const CategoryModel = require('../models/category.model');

const getAllCategories = async (req, res, next) => {
  try {
    const categories = await CategoryModel.findAll();
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const category = await CategoryModel.create(name, description);
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllCategories, createCategory };