import { Schema, model } from "mongoose";

const CarritoSchema = Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User", // Hace referencia al modelo de usuario
    required: true,
  },
  products: [
    {
      product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
      cantidad: { type: Number, required: true },
    },
  ],
  estado: {
    type: Boolean,
    default: true, // El carrito está activo, aún no se ha comprado
  },
}, { timestamps: true });

export default model("Carrito", CarritoSchema);