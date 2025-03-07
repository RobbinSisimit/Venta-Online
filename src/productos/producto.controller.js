import Productos from "../productos/producto.model.js";
import mongoose from "mongoose";
import Categoria from "../categoria/categoria.model.js";

export const crearProductos = async (req, res) => {
    try {
        const { name, description, precio, categoria, stock } = req.body;

        const categoryExists = await Categoria.findById(categoria);
        if (!categoryExists) {
            return res.status(400).json({
                success: false,
                message: "Categoría no válida"
            });
        }

        const existingProduct = await Productos.findOne({ name });
        if (existingProduct) {
            return res.status(400).json({
                success: false,
                message: "Ya existe un producto con este nombre bobo",
            });
        }

        const producto = new Productos({
            name,
            description,
            precio,
            categoria,
            stock,
            status: true
        });

        await producto.save();

        res.status(200).json({
            success: true,
            message: "Producto Creado (happy happy):D",
            producto
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error al guardar el Producto bobo ",
            error
        });
    }
};


export const listarProductos = async (req, res) => {
    try {
        const { bestSeller } = req.query;
        let query = { estado: true };

        if (bestSeller) query.ventas = { $gte: Number(bestSeller) };

        const products = await Productos.find(query)
            .populate('categoria', 'name') 
            .sort({ ventas: -1 })
            .lean();

        res.status(200).json({
            success: true,
            total: products.length,
            products
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al listar productos",
            error: error.message
        });
    }
};

export const actulizarProductos = async (req, res) => {
    try{
        const {id} = req.params
        const {...data} = req.body

        const productoActualizado  = await Productos.findByIdAndUpdate(id,data,{new:true})

        if (!productoActualizado ) {
            return res.status(404).json({
                success: false,
                message: "Producto no encontrado."
            });
        }

        res.status(200).json({
            success:true,
            msg:'Actualice el producto oiste.....',
            productoActualizado 
        })

    }catch(error){
        res.status(500).json({
            msg:"error al actulizar bobo",
            error
        })
    }
}

export const eliminarProducto = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si el ID es válido antes de buscar el producto
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "El ID proporcionado no es válido."
            });
        }

        // Buscar el producto antes de eliminarlo
        const producto = await Productos.findById(id);
        if (!producto) {
            return res.status(404).json({
                success: false,
                message: "Producto no encontrado."
            });
        }

        await Productos.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Producto eliminado correctamente."
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al eliminar el producto.",
            error: error.message
        });
    }
};

export const listarProductosAgotados = async (req, res) => {
    try {

        const productosAgotados = await Productos.find({ stock: 0 }).lean();

        if (productosAgotados.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No hay productos agotados no se ha vendido nada :("
            });
        }

        res.status(200).json({
            success: true,
            total: productosAgotados.length,
            productosAgotados
        });
    } catch (error) {
        res.status(500).json({
            message: "Error al listar productos agotados bobo",
            error: error.message
        });
    }
};

export const listarProductosMasVendidos = async (req, res) => {
  try {

    const { limit = 5 } = req.query; 

    const productosMasVendidos = await Productos.find({ estado: true })
      .sort({ ventas: -1 }) 
      .limit(Number(limit)) 
      .lean(); 

    if (productosMasVendidos.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No hay productos vendidos"
      });
    }

    res.status(200).json({
      success: true,
      total: productosMasVendidos.length,
      productosMasVendidos
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener los productos más vendidos",
      error: error.message
    });
  }
};

export const listarProductosPorCategoria = async (req, res) => {
    try {
        const { categoriaId } = req.params;  // Recibe el ID de la categoría desde los parámetros

        // Verificar que la categoría sea válida
        if (!categoriaId) {
            return res.status(400).json({
                success: false,
                msg: "Categoría no proporcionada"
            });
        }

        // Buscar los productos que pertenecen a la categoría especificada
        const productos = await Productos.find({ category: categoriaId, estado: true })  // Asegúrate de filtrar por estado si es necesario
            .populate("category", "name")  // Poblamos la categoría con su nombre (opcional)
            .lean();  // Convierte el resultado a un objeto simple (sin métodos de Mongoose)

        if (productos.length === 0) {
            return res.status(404).json({
                success: false,
                msg: "No se encontraron productos en esta categoría"
            });
        }

        res.status(200).json({
            success: true,
            total: productos.length,
            productos
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al listar los productos",
            error: error.message
        });
    }
};