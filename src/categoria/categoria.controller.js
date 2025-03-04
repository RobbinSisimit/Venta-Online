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
