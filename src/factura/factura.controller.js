import Factura from '../factura/factura.model.js'; // Importar el modelo de Factura
import Carrito from '../carritoCompras/carritoCompras.model.js'; // Importar el modelo de Carrito
import Producto from '../productos/producto.model.js'; // Importar el modelo de Product

export const confirmarCompra = async (req, res) => {
    try {
      const { user } = req.body; // Recibimos el ID del usuario
  
      // Buscar el carrito del usuario
      const carrito = await Carrito.findOne({ user })
        .populate('products.product');  // Obtener los productos con los detalles completos
  
      if (!carrito) {
        return res.status(404).json({
          message: "Carrito no encontrado"
        });
      }
  
      // Verificar si el carrito está vacío
      if (carrito.products.length === 0) {
        return res.status(400).json({
          message: "El carrito está vacío"
        });
      }
  
      // Crear una nueva factura con los productos del carrito
      const nuevaFactura = new Factura({
        user: carrito.user,
        products: carrito.products.map(item => ({
          product: item.product._id,  // Guardamos solo el ID del producto
          cantidad: item.cantidad,
          subtotal: item.subtotal
        })),
        total: carrito.total,  // El total del carrito
        estado: true,  // El estado de la factura será "confirmada"
        fechaCompra: new Date(),
      });
  
      // Guardar la nueva factura
      const facturaGuardada = await nuevaFactura.save();
  
      // Actualizar el stock de los productos y aumentar las ventas
      for (let item of carrito.products) {
        const producto = await Producto.findById(item.product._id);
        
        if (producto) {
          // Actualizar el stock
          producto.stock -= item.cantidad;
  
          // Aumentar las ventas
          producto.ventas += item.cantidad;
  
          // Guardar los cambios en el producto
          await producto.save();
        }
      }
  
      // Limpiar el carrito después de la compra
      carrito.products = [];
      carrito.total = 0;
      await carrito.save();
  
      // Responder con la factura generada y mostrar los detalles de los productos
      const facturaConDetalles = await Factura.findById(facturaGuardada._id)
        .populate('products.product');  // Poblamos los detalles de los productos
  
      res.status(200).json({
        message: "Compra confirmada exitosamente",
        factura: facturaConDetalles  // Devolvemos la factura con los productos poblados
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
      const { facturaID } = req.params; // Recibimos el ID de la factura
  
      // Buscar la factura en la base de datos
      const factura = await Factura.findById(facturaID).populate('products.product');  // Cambié 'productos.product' por 'products.product'
  
      if (!factura) {
        return res.status(404).json({ message: 'Factura no encontrada' });
      }
  
      // Verificar si la factura está confirmada (estado == true)
      if (!factura.estado) {
        return res.status(400).json({ message: 'La compra ya ha sido cancelada o no está confirmada' });
      }
  
      // Revertir el stock y las ventas de los productos
      for (let item of factura.products) { // Cambié 'productos' por 'products'
        const producto = await Producto.findById(item.product._id); // Asegúrate de que el modelo sea Producto
  
        if (producto) {
          // Aumentar el stock y disminuir las ventas
          producto.stock += item.cantidad;
          producto.ventas -= item.cantidad;
          await producto.save();
        }
      }
  
      // Cambiar el estado de la factura a 'false' para indicar que la compra fue cancelada
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