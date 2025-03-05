import Categoria from '../categoria/categoria.model.js';

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

export const deleteCategory = async (req,res) => {
    try {
        const {id} = req.params
        const categoria = await Categoria.findById(id)

        if (!categoria) {
            return res.status(404).json({
                ss:false,
                message: "Category not found"
            })
        }

        // Buscar la categoria por defecto
        const defaultCategory = await Categoria.findOne({name:'Productos Sin Categoria'})
        if (!defaultCategory) {
            return res.status(404).json({
                message: "No hay categoria por defecto para asignarle los pobrecitos productos"
            })
        }

        // Buscar los productos de la categoría eliminada
        const productosHuerfanos = await Product.find({category: id})

        // Mover a los productos huérfanos
        await Product.updateMany({ category:id }, {category: defaultCategory._id})

        //Agregar los productos al array de la categoria por defecto
        defaultCategory.products.push(...productosHuerfanos.map(product => product._id))
        defaultCategory.markModified('products');
        await defaultCategory.save()

        const deletedCategory = await Category.findByIdAndUpdate(id,{estado:false},{new:true})

        res.status(200).json({
            message: "Category deleted successfully",
            deletedCategory
        })

    } catch (error) {
        res.status(500).json({
            message: "Error deleting category boludin",
            error: error.message
        })
    }
}
