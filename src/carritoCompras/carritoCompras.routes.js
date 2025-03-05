import { Router } from "express";
import { check } from "express-validator";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { addToCar, getCar, eliminaProducto } from "./carritoCompras.controller.js";  // Importar correctamente
import { validarRol } from "../middlewares/validar-roles.js";

const router = Router();

// Ruta para agregar productos al carrito
router.post('/', 
  [
    validarJWT,
    check("user", "El ID del usuario es obligatorio").not().isEmpty(),
    check("productID", "El ID del producto es obligatorio").not().isEmpty(),
    check("cantidad", "La cantidad es obligatoria").not().isEmpty(),
    validarCampos
  ], 
  addToCar
);

router.get('/:user', 
    [validarJWT],
    getCar
);

router.delete('/remove', 
    [
        validarJWT, 
        check("user", "El ID de usuario es obligatorio").not().isEmpty(), 
        check("productID", "El ID del producto es obligatorio").not().isEmpty(), 
        validarCampos
    ],
    eliminaProducto
);

export default router;
