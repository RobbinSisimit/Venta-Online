import Factura from '../factura/factura.model.js';
import Carrito from '../carritoCompras/carritoCompras.model.js'; 
import Producto from '../productos/producto.model.js'; 

export const confirmarCompra = async (req, res) => {
    try {
      const { user } = req.body; 

      const carrito = await Carrito.findOne({ user })
        .populate('products.product');  
  
      if (!carrito) {
        return res.status(404).json({
          message: "Carrito no encontrado"
        });
      }
  

      if (carrito.products.length === 0) {
        return res.status(400).json({
          message: "El carrito está vacío"
        });
      }

      const nuevaFactura = new Factura({
        user: carrito.user,
        products: carrito.products.map(item => ({
          product: item.product._id, 
          cantidad: item.cantidad,
          subtotal: item.subtotal
        })),
        total: carrito.total,  
        estado: true,  
        fechaCompra: new Date(),
      });
  

      const facturaGuardada = await nuevaFactura.save();
  

      for (let item of carrito.products) {
        const producto = await Producto.findById(item.product._id);
        
        if (producto) {

          producto.stock -= item.cantidad;
  
         
          producto.ventas += item.cantidad;
  
          await producto.save();
        }
      }
  

      carrito.products = [];
      carrito.total = 0;
      await carrito.save();
  

      const facturaConDetalles = await Factura.findById(facturaGuardada._id)
        .populate('products.product'); 
  
      res.status(200).json({
        message: "Compra confirmada exitosamente",
        factura: facturaConDetalles  
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Error al confirmar la compra",
        error: error.message
      });
    }
  };
  


export const cancelarCompra = async (req, res) => {
    try {
      const { facturaID } = req.params; 
  
      const factura = await Factura.findById(facturaID).populate('products.product');  // Cambié 'productos.product' por 'products.product'
  
      if (!factura) {
        return res.status(404).json({ message: 'Factura no encontrada' });
      }
  

      if (!factura.estado) {
        return res.status(400).json({ message: 'La compra ya ha sido cancelada o no está confirmada' });
      }
  

      for (let item of factura.products) { 
        const producto = await Producto.findById(item.product._id); 
  
        if (producto) {
          // Aumentar el stock y disminuir las ventas
          producto.stock += item.cantidad;
          producto.ventas -= item.cantidad;
          await producto.save();
        }
      }
  

      factura.estado = false;
      await factura.save();
  
      res.status(200).json({
        message: 'Compra cancelada y stock revertido.',
        factura
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Error al cancelar la compra.',
        error: error.message
      });
    }
};