import Carrito from "./carritoCompras.model.js";
import Producto  from "../productos/producto.model.js";



export const addToCar = async (req, res) => {
  try {
    const { user, productID, cantidad } = req.body;

    // Validación de cantidad
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

    const subtotalProducto = Number(product.precio) * Number(cantidad);

    // Buscar si el usuario ya tiene un carrito
    let car = await Carrito.findOne({ user });

    if (!car) {
      // Crear carrito si no existe
      car = await Carrito.create({
        user,
        products: [{
          product: product._id,
          cantidad,
          precio: product.precio,
          subtotal: subtotalProducto
        }],
        subtotal: subtotalProducto,
        total: subtotalProducto
      });
    } else {
      // Verificar si el producto ya está en el carrito
      const existingProduct = car.products.find(p => p.product.toString() === productID);

      if (existingProduct) {
        // Si el producto ya está, sumamos la cantidad y recalculamos el subtotal
        existingProduct.cantidad += cantidad;
        existingProduct.subtotal = existingProduct.cantidad * existingProduct.precio;
      } else {
        // Si no está, lo agregamos al carrito
        car.products.push({
          product: product._id,
          cantidad,
          precio: product.precio,
          subtotal: subtotalProducto
        });
      }

      // Recalcular el subtotal y el total del carrito
      car.subtotal = car.products.reduce((acc, item) => acc + (item.subtotal || 0), 0);
      car.total = car.subtotal; // Puedes calcular un total diferente si lo deseas (descuentos, impuestos, etc.)
    }

    // Guardar los cambios en el carrito
    await car.save();

    // **Populate user y productos**
    car = await Carrito.findOne({ user })
      .populate("user", "name email")
      .populate({
        path: "products.product",
        strictPopulate: false
      });

    const carObject = car.toObject({ virtuals: true });

    res.status(200).json({
      message: "Producto agregado al carrito.",
      car: carObject
    });
  } catch (error) {
    console.error(error);
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