import Carrito from "./carritoCompras.model.js";
import Producto  from "../productos/producto.model.js";

export const addToCar = async (req, res) => {
  try {
    const { user, productID, cantidad } = req.body; // ID del producto y cantidad

    // Validar que la cantidad es un número y mayor que 0
    if (!cantidad || isNaN(cantidad) || cantidad <= 0) {
      return res.status(400).json({
        message: "Cantidad inválida, debe ser un número mayor que 0."
      });
    }

    const product = await Producto.findById(productID);
    if (!product) {
      return res.status(404).json({
        message: "Producto no encontrado."
      });
    }

    // Validar que el precio del producto es un número y mayor que 0
    if (isNaN(product.precio) || product.precio <= 0) {
      return res.status(400).json({
        message: "El precio del producto es inválido."
      });
    }

    // Calcular el subtotal del producto
    const subtotal = Number(product.precio) * Number(cantidad);

    // Validar que el subtotal sea un número y mayor que 0
    if (isNaN(subtotal) || subtotal <= 0) {
      return res.status(400).json({
        message: "El cálculo del subtotal no es válido."
      });
    }

    // Buscar si el usuario ya tiene un carrito
    let car = await Carrito.findOne({ user });

    if (!car) {
      // Si el usuario no tiene carrito, se le crea uno con el primer producto
      car = await Carrito.create({
        user,
        products: [{
          product: product._id,
          cantidad,
          precio: product.precio,
          subtotal // Agregar el subtotal calculado aquí
        }],
        // El total es la suma de los subtotales de los productos
        total: subtotal, // Total inicial con el primer producto
        subtotal // El subtotal del carrito también se inicializa aquí
      });
    } else {
      // Si ya tiene carrito, verifica si el producto ya está en el carrito
      const existingProduct = car.products.find(p => p.product.toString() === productID);

      if (existingProduct) {
        // Si el producto ya está, suma la cantidad y recalcula el subtotal
        existingProduct.cantidad += cantidad;
        existingProduct.subtotal = Number(existingProduct.cantidad) * Number(existingProduct.precio);
      } else {
        // Si no está, se agrega al array de productos con el subtotal
        car.products.push({
          product: product._id,
          cantidad,
          precio: product.precio,
          subtotal // Agregar el subtotal calculado aquí
        });
      }

      // Recalcular el total y el subtotal del carrito
      car.total = car.products.reduce((acc, item) => acc + (Number(item.subtotal) || 0), 0);
      car.subtotal = car.products.reduce((acc, item) => acc + (Number(item.subtotal) || 0), 0);
    }

    // Guardar los cambios en el carrito
    await car.save();

    // **Populate user y productos**
    car = await Carrito.findOne({ user })
      .populate("user", "name email")
      .populate("products.product");

    // Convertir a objeto plano de JS para incluir los campos virtuales
    const carObject = car.toObject({ virtuals: true });

    res.status(200).json({
      message: "Producto agregado al carrito.",
      car: carObject
    });
  } catch (error) {
    console.error(error); // Para depuración
    res.status(500).json({
      message: "Error al agregar al carrito.",
      error: error.message
    });
  }
};


export const getCar = async (req, res) => {
  try {
      const { user } = req.params;

      // Buscar el carrito del usuario
      let carrito = await Carrito.findOne({ user })
          .populate("user", "name email")
          .populate("products.product");

      if (!carrito) {
          return res.status(404).json({
              message: "Carrito no encontrado"
          });
      }

      // Recalcular subtotales y total
      let total = 0;
      let subtotal = 0; // Subtotal para el carrito

      // Iteramos sobre los productos y calculamos el subtotal de cada producto
      carrito.products = carrito.products.map(item => {
          const productSubtotal = item.cantidad * item.product.precio; // Subtotal del producto individual
          subtotal += productSubtotal; // Sumamos al subtotal total
          return {
              ...item,
              subtotal: productSubtotal // Agregamos el subtotal del producto al objeto
          };
      });

      carrito.subtotal = subtotal; // Asignamos el subtotal final al carrito
      carrito.total = subtotal; // Si tienes un total que depende solo del subtotal, también lo asignas

      res.status(200).json({
          message: "Carrito encontrado",
          carrito
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({
          message: "Error al obtener el carrito",
          error: error.message
      });
  }
};

export const eliminaProducto = async (req, res) => {
    try {
        const { user, productID, cantidad } = req.body; // Recibimos el ID de usuario, el ID del producto y la cantidad a eliminar.
    
        // Buscar el carrito del usuario
        const carrito = await Carrito.findOne({ user });
    
        if (!carrito) {
          return res.status(404).json({
            message: "Carrito no encontrado"
          });
        }
    
        // Buscar el producto en el carrito
        const productIndex = carrito.products.findIndex(p => p.product.toString() === productID);
    
        if (productIndex === -1) {
          return res.status(404).json({
            message: "Producto no encontrado en el carrito"
          });
        }
    
        // Obtener el producto del carrito
        const productInCart = carrito.products[productIndex];
    
        // Verificar que la cantidad a eliminar no sea mayor a la cantidad actual en el carrito
        if (productInCart.cantidad < cantidad) {
          return res.status(400).json({
            message: `No hay suficiente cantidad de este producto en el carrito. Solo hay ${productInCart.cantidad} unidades.`
          });
        }
    
        // Reducir la cantidad del producto en el carrito
        productInCart.cantidad -= cantidad;
    
        // Si la cantidad se reduce a 0, eliminar el producto del carrito
        if (productInCart.cantidad === 0) {
          carrito.products.splice(productIndex, 1);
        }
    
        // Guardar los cambios en el carrito
        await carrito.save();
    
        res.status(200).json({
          message: `Se ha eliminado ${cantidad} unidades del producto.`,
          carrito
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({
          message: "Error al eliminar el producto del carrito.",
          error: error.message
        });
      }
};