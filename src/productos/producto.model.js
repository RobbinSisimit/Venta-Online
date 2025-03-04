import {Schema, model} from "mongoose"

const ProductSchema = Schema({
    name: {
        type: String,
        required: [true, "El Nombre Del producto Es Obligatorio :D"],
    },
    description:{
        type: String,
        required: [true,'Ingrese la descripccion obligatorio :D']
    },
    precio:{
        type: Number,
        required: [true,'El precio del producto Obligatorio :D '],
        min: [0, "El precio tiene un valor minimo que es 0 :S"]
    },
    stock:{
        type: Number,
        required: [true,'El stock del producto obligatorio ;D'],
        min: [0, "El Stock tiene fin y es el cero :D"]
    },
    categoria:{
        type: Schema.Types.ObjectId,
        ref: 'Categoria',
        required: [true,'El prodcuto necesita una categoria :D']
    },
    ventas:{
        type: Number,
        default: 0
    },
    estado:{
        type: Boolean,
        default: true
    }
})

ProductSchema.methods.toJSON = function() {
    const {__v,password,_id,...product} = this.toObject()
    product.uid = _id
    return product
}

export default model('Product',ProductSchema)