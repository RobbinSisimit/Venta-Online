import mongoose from "mongoose";

const CategoriaSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "El Nombre De La Categoría Es Obligatorio :D"],
        unique: true
    },
    status: {
        type: Boolean,
        default: true
    },
    products: [{ 
        type: mongoose.Schema.Types.ObjectId, ref: 'Productos' 
    }] 
}, {
    timestamps: true,
    versionKey: false
});

export default mongoose.model("Categoria", CategoriaSchema);