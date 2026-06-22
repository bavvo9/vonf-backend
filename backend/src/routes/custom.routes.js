const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload.middleware'); // 👈 Importamos Multer
const adminMiddleware = require('../middlewares/admin.middleware');
const authMiddleware = require('../middlewares/auth.middleware');

const{createForm,
      getAllForms} = require('../controllers/custom.controller');



router.get('/', authMiddleware, adminMiddleware, getAllForms);
router.post('/', upload.single('image'), createForm);



module.exports = router;
