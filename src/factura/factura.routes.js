import { Router } from "express";
import { confirmarCompra, cancelarCompra } from './factura.controller.js';
import { validarJWT } from "../middlewares/validar-jwt.js";

const router = Router();

router.post('/',
    [
        validarJWT
    ] 
    ,confirmarCompra
);


router.put('/cancelarCompra/:facturaID',
    [
        validarJWT
    ], 
    cancelarCompra
);

export default router;