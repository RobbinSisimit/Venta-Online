import { Router } from "express";
import { check } from "express-validator";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { crearProductos, listarProductos } from "./producto.controller.js";

const router = Router();
router.get('/', listarProductos);

router.post('/', 
    [
        validarJWT,
        check("name", "El nombre es obligatorio").not().isEmpty(),
        check("precio", "El precio es obligatorio").not().isEmpty(),
        check("description", "La descripción es obligatorio").not().isEmpty(),
        validarCampos
    ], 
    crearProductos
);


export default router