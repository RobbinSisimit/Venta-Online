'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { dbConnection } from './mongo.js';
import limiter from '../src/middlewares/validar-cant-peticiones.js'
import authRoutes from '../src/auth/auth.routes.js';
import authUsers from '../src/users/user.routes.js';
import categoriaRoutes from "../src/categoria/categoria.routes.js";
import productoRoustes from '../src/productos/producto.routes.js';
import carritoRoutes from '../src/carritoCompras/carritoCompras.routes.js';
import facturaRoutes from '../src/factura/factura.routes.js';

import Category from '../src/categoria/categoria.model.js';

const configurarMiddlewares = (app) => {
    app.use(express.urlencoded({extended: false}));
    app.use(cors());
    app.use(express.json());
    app.use(helmet());
    app.use(morgan('dev'));
    app.use(limiter);
}

const configurarRutas = (app) =>{
    app.use("/Online/v1/auth", authRoutes);
    app.use("/Online/v1/users",authUsers);
    app.use("/Online/v1/categoria", categoriaRoutes);
    app.use("/Online/v1/producto", productoRoustes);
    app.use("/Online/v1/carrito", carritoRoutes);
    app.use("/Online/v1/factura", facturaRoutes);
}

const conectarDB = async () => {
    try {
        await dbConnection();
        console.log("Conexion Exitosa Con La Base De Datos");
        await categoriaGeneral();
    } catch (error) {
        console.log("Error Al Conectar Con La Base De Datos", error);
    }
}

export const categoriaGeneral = async () => {
    try {
        const defaultCategory = await Category.findOne({name:"General"})

        if (!defaultCategory) {
            const category = await Category.create({
                name: "General"
            })
            await category.save()
        }else{
            console.log("Categoria por defecto creada")
        }


    } catch (error) {
        console.log('No pudimos crear la categoria baluk.')
    }
}


export const iniciarServidor = async () => {
    const app = express();
    const port = process.env.PORT || 3010;

    await conectarDB();
    configurarMiddlewares(app);
    configurarRutas(app);

    app.listen(port, () => {
        console.log(`Server Running On Port ${port}`);
    });
}