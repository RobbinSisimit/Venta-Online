import Productos from "../productos/producto.model.js";
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


export const listarProductos = async (req,res) => {
    try {
        const { bestSeller } = req.query;
        let query = { estado: true };

        if (bestSeller) query.ventas = { $gte: Number(bestSeller) }; // Filtrar por ventas mínimas

        // Obtener los productos filtrados y ordenados
        const products = await Productos.find(query)
            .sort({ ventas: -1 }) // Ordenar de mayor a menor
            .lean();
        const total = products.length;

        res.status(200).json({
            success:true,
            total,
            products
        })
    } catch (error) {
        res.status(500).json({
            message: "Error getting products",
            error: error.message
        })
    }
}