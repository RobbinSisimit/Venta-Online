import { Router } from "express";
import { check } from "express-validator";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { crearProductos, listarProductos, actulizarProductos, eliminarProducto } from "./producto.controller.js";
import { validarRol } from "../middlewares/validar-roles.js";

const router = Router();
router.get('/', listarProductos);

router.post('/', 
    [
        validarJWT,
        check("name", "El nombre es obligatorio").not().isEmpty(),
        check("precio", "El precio es obligatorio").not().isEmpty(),
        check("description", "La descripción es obligatorio").not().isEmpty(),
        validarRol("ADMIN_ROLE"),
        validarCampos
    ], 
    crearProductos
);

router.put("/:id",
    [
        validarJWT,
        check('id', 'El ID no correspode :(').isMongoId(),
        validarRol("ADMIN_ROLE"),
        validarCampos
    ],
    actulizarProductos
)

router.delete("/:id",
    [
        validarJWT,
        check('id', 'El ID no correspode :(').isMongoId(),
        validarRol("ADMIN_ROLE"),
        validarCampos
    ],
    eliminarProducto
);

export default router