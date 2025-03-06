import { Router } from "express";
import { confirmarCompra, cancelarCompra } from './factura.controller.js'; // Importamos las funciones

const router = Router();

// Ruta para confirmar la compra
// Utilizamos el método POST porque queremos crear una nueva factura confirmada
router.post('/', confirmarCompra);

// Ruta para cancelar la compra
// Utilizamos el método PUT para modificar el estado de la factura
router.put('/cancelarCompra/:facturaID', cancelarCompra);

export default router;