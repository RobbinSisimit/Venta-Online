import Categoria from '../categoria/categoria.model.js';
import Productos  from '../productos/producto.model.js'

export const crearCategoria = async (req, res) =>{
    try{
        const {name} = req.body;
        const categoria = new Categoria({name});
        await categoria.save();
        res.status(200).json({
            successf: true,
            msg: "Categoria creado :D",
            categoria
        })
    }catch(error){
        res.status(500).json({
            success: false,
            msg:"Error al crear la categoria bobo",
            error
        });
    }
};

export const listarCategoria = async (req, res)=>{
    try{
        const categorias = await Categoria.find({status:true});
        res.status(200).json({
            success: true,
            msg: "Categorias listadas :D",
            categorias
        })
    }catch(error){
        res.status(500).json({
            success: false,
            msg: "Error al listar la categoria bobo",
            error
        })
    }
};

export const actulizarCategoria = async (req, res) =>{
    try{
        const { id } = req.params;
        const { name } = req.body;
        const categoria = await Categoria.findByIdAndUpdate(id, {name}, {new: true});

        res.status(200).json({
            success: true,
            msg: "Categoria actualizada :D",
            categoria
        })
    }catch(error){
        res.status(500).json({
            succes: true,
            msg: "Error al actualizar la categoria bobo",
            error
        });
    }
};



export const EliminarCategoira = async (req,res) => {
    try {
        const { id } = req.params;
        const categoria = await Categoria.findById(id);

        if (!categoria) {
            return res.status(400).json({
                success: false,
                message: "Category not found"
            });
        }


        const defaultCategory = await Categoria.findOne({ name: 'General' });
        if (!defaultCategory) {
            return res.status(404).json({
                message: "No hay categoría por defecto para asignarle los productos"
            });
        }


        const productosSinCategoria = await Productos.find({ categoria: id });


        await Productos.updateMany({ categoria: id }, { categoria: defaultCategory._id });


        defaultCategory.products.push(...productosSinCategoria.map(producto => producto._id));
        defaultCategory.markModified('products');
        await defaultCategory.save();

        const deletedCategory = await Categoria.findByIdAndDelete(id);

        res.status(200).json({
            message: "Category deleted successfully",
            deletedCategory
        });

    } catch (error) {
        res.status(500).json({
            message: "Error al eliminar categoria",
            error: error.message
        });
    }
}
