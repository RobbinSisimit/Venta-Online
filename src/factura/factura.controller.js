import Factura from '../factura/factura.model.js';
import Carrito from '../carritoCompras/carritoCompras.model.js'; 
import Producto from '../productos/producto.model.js'; 

export const confirmarCompra = async (req, res) => {
  try {
    const { user } = req.body;

    // Buscar el carrito del usuario
    const carrito = await Carrito.findOne({ user })
      .populate("products.product") // Populamos los productos
      .exec();

    if (!carrito || carrito.products.length === 0) {
      return res.status(400).json({
        message: "El carrito está vacío o no existe.",
      });
    }

    // Calcular el total del carrito si no está calculado
    let totalCarrito = 0;
    carrito.products.forEach((item) => {
      if (!item.subtotal || item.subtotal === undefined) {
        item.subtotal = item.cantidad * item.product.precio;
      }
      totalCarrito += item.subtotal;
    });

    // Verificar si el total es válido
    if (isNaN(totalCarrito) || totalCarrito <= 0) {
      return res.status(400).json({
        message: "El total del carrito es inválido",
      });
    }

    // Crear una nueva factura con los productos del carrito
    const nuevaFactura = new Factura({
      user: carrito.user,
      productos: carrito.products.map((item) => ({
        product: item.product._id,
        cantidad: item.cantidad,
        precio: item.precio,
        subtotal: item.subtotal,
      })),
      total: totalCarrito,
      estado: true, // Compra confirmada
    });

    // Guardar la factura
    const facturaGuardada = await nuevaFactura.save();

    // Reducir el stock de los productos
    await Promise.all(
      carrito.products.map(async (item) => {
        const producto = await Producto.findById(item.product._id);
        if (producto) {
          producto.stock -= item.cantidad;
          producto.ventas += item.cantidad;
          await producto.save();
        }
      })
    );

    // Vaciar el carrito después de la compra
    carrito.products = [];
    carrito.subtotal = 0;
    carrito.total = 0;
    await carrito.save();

    // Retornar la factura creada
    const facturaConDetalles = await Factura.findById(facturaGuardada._id).populate("productos.product");

    res.status(200).json({
      message: "Compra confirmada exitosamente",
      factura: facturaConDetalles,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al confirmar la compra",
      error: error.message,
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

export const historialDeCompras = async (req, res) => {
  try {
      const userId = req.usuario._id; // El id del usuario autenticado (lo obtenemos de la autenticación JWT)

      // Buscar todas las facturas que pertenecen al usuario
      const historial = await Factura.find({ user: userId })
          .populate("productos.product") // Poblamos la información de los productos en cada factura
          .sort({ fechaCompra: -1 }); // Ordenamos por la fecha de la compra de más reciente a más antigua

      if (historial.length === 0) {
          return res.status(404).json({
              success: false,
              msg: "No has realizado compras aún"
          });
      }

      // Respondemos con el historial de compras
      res.status(200).json({
          success: true,
          historial
      });
  } catch (error) {
      res.status(500).json({
          success: false,
          msg: "Error al obtener el historial de compras",
          error: error.message
      });
  }
};