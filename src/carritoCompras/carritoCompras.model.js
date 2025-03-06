  import { Schema, model } from "mongoose";

  const CarritoSchema = new Schema({
      user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true
      },
      products: [
          {
              product: {
                  type: Schema.Types.ObjectId,
                  ref: "Product", // Asegúrate de que el nombre del modelo sea correcto
                  required: true
              },
              cantidad: {
                  type: Number,
                  required: true,
                  min: 1
              },
              precio: {
                  type: Number, // Guardamos el precio del producto en el momento de la compra
                  required: true
              }
          }
      ],
      subtotal: {
          type: Number,
          default: 0 // Inicialmente en 0
      }
  });

  export default model("Carrito", CarritoSchema);