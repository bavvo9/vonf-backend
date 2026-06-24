const CustomModel = require('../models/custom.model');
const AppError = require('../utils/appError');
const { uploadImage } = require('../utils/cloudinary'); // para subir imagenes a cloudinary
const fs = require('fs'); // para borrar el archivo


const createForm = async (req, res, next) => {
    try{
        const user_id = req.user ? req.user.id : null;
        const {full_name, contact_info, description} = req.body;

        let image_url = null;
    
        if(!contact_info){
            throw new AppError('Se espera un medio de contacto', 400);
        }

        if(!full_name){
            throw new AppError('Se espera el nombre completo', 400);
        }

        if(!description && !req.file){
            throw new AppError('Debes incluir una descripción o una imagen de referencia', 400);
        }

        // Si hay archivo, subimos a Cloudinary
        if (req.file) {
            image_url = await uploadImage(req.file.buffer);
            // 2. Borramos el archivo local temporal
           // fs.unlinkSync(req.file.path);
        }

        const form = await CustomModel.createForm(user_id, full_name, contact_info, description, image_url);
        
        res.status(201).json({message:'Formulario envíado con éxito', form});

    }
    catch(error){
        // Si hubo error y se subió una imagen pero falló algo más,
        // borramos el archivo temporal si quedó ahí.
       // if (req.file && fs.existsSync(req.file.path)) {
         //   fs.unlinkSync(req.file.path);
        //}
        next(error); 
    }
}

const getAllForms = async (req, res, next) => {
    try{
        const forms = await CustomModel.getAllForms();
        res.json(forms);
    }
    catch(error){
        next(error);
    }
}

module.exports={
    createForm, getAllForms
}