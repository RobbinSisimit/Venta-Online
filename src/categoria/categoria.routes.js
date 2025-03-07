import { Router } from "express";
import { crearCategoria, listarCategoria, actulizarCategoria, EliminarCategoira } from "../categoria/categoria.controller.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { validarRol } from "../middlewares/validar-roles.js";

const router = Router();

router.post(
    "/",
    [
        validarJWT,
        validarRol("ADMIN_ROLE")
    ],
    crearCategoria
);

router.get(
    "/",
    listarCategoria
);

router.put(
    "/:id/",
    [
        validarJWT,
        validarRol("ADMIN_ROLE")
    ],
    actulizarCategoria
)

router.delete(
    "/:id/",
    [
        validarJWT,
        validarRol("ADMIN_ROLE")
    ],
    EliminarCategoira
)

export default router;