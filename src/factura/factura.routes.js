import { Router } from "express";
import { confirmarCompra, cancelarCompra, historialDeCompras } from './factura.controller.js';
import { validarJWT } from "../middlewares/validar-jwt.js";

const router = Router();

router.post('/',
    [
        validarJWT
    ] 
    ,confirmarCompra
);

router.get("/historial", validarJWT, historialDeCompras);

router.put('/cancelarCompra/:facturaID',
    [
        validarJWT
    ], 
    cancelarCompra
);

export default router;