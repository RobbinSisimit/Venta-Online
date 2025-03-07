import { response, request } from "express";
import { hash } from "argon2";
import User from "./user.model.js";

export const getUsers = async (req = request, res = response) => {
    try {
        const { limite = 10, desde = 0 } = req.query;

        const query = { estado: true };

        const [total, users] = await Promise.all([
            User.countDocuments(query),
            User.find(query)
                .skip(Number(desde))
                .limit(Number(limite))
        ]);

        res.status(200).json({
            success: true,
            total,
            users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error Al Obtener Usuario",
            error
        });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "Usuario Not Found"
            });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error Al Obtener Usuario",
            error
        });
    }
};

export const updateUser = async (req, res = response) => {
    try {
        const { id } = req.params;
        const { password, role, ...data } = req.body;

         // Si se proporciona un nuevo rol
         if (role) {
            // Si el rol es 'USER_ROLE' no debería haber restricciones
            if (role === "USER_ROLE") {
                data.role = "USER_ROLE";
            } 
            // Si el rol es 'ADMIN_ROLE' y el usuario actual es ADMIN, le damos permiso
            else if (role === "ADMIN_ROLE" && req.usuario.role === "ADMIN_ROLE") {
                data.role = "ADMIN_ROLE";
            } else {
                return res.status(403).json({
                    success: false,
                    msg: "No tienes permisos para cambiar el rol a ADMIN_ROLE"
                });
            }
        }


        if (password) {
            data.password = await hash(password);
        }

        const user = await User.findByIdAndUpdate(id, data, { new: true });


        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "Usuario no encontrado :("
            });
        }


        res.status(200).json({
            success: true,
            msg: "Usuario Actualizado :)",
            user
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            msg: "Error Al Actualizar Usuario bobo",
            error: error.message
        });
    }
};


export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (req.usuario.role !== "ADMIN_ROLE") {
            return res.status(403).json({
                success: false,
                msg: "No está autorizado para eliminar a otros usuarios"
            });
        }

        const user = await User.findByIdAndUpdate(id, { estado: false }, { new: true });

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: 'Usuario no encontrado :(no existes :())'
            });
        }

        res.status(200).json({
            success: true,
            msg: 'Usuario desactivado :(',
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al Desactivar El Usuario bobin',
            error
        });
    }
};
