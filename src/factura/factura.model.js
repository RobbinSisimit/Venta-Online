import mongoose from 'mongoose';

const facturaSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Referencia al usuario que hace la compra
    required: true
  },
  productos: [{  // Asegúrate de usar "productos" en plural
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product', // Referencia al producto
      required: true
    },
    cantidad: {
      type: Number,
      required: true
    },
    precio: {
      type: Number,
      required: true
    },
    subtotal: {
      type: Number,
      required: true
    }
  }],
  total: {
    type: Number,
    required: true
  },
  fechaCompra: {
    type: Date,
    default: Date.now
  },
  estado: {
    type: Boolean,
    default: true // true significa que la compra está confirmada
  }
});

facturaSchema.methods.toJSON = function() {
    const {__v, _id, ...factura} = this.toObject();
    factura.uid = _id;
    return factura;
}

export default mongoose.model("Factura",facturaSchema);
