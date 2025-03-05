import Carrito from "./carritoCompras.model.js";
import Productos  from "../productos/producto.model.js";

export const addToCar = async (req, res) => {
    try {
      const { user, productID, cantidad } = req.body; // ID Del producto y la cantidad
  
      const product = await Productos.findById(productID); // Usa 'Productos' en lugar de 'Product'
      if (!product) {
        return res.status(404).json({
          message: "Producto no encontrado."
        });
      }
  
      // Buscar si el user ya tiene un carrito
      let car = await Carrito.findOne({ user });
  
      if (!car) {
        // Si el usuario no tiene carrito, se le crea uno
        car = await Carrito.create({
          user,
          products: [{ product: product._id, cantidad }]
        });
      } else {
        // Si ya tiene carrito, verifica si el producto ya está en el carrito
        const existingProduct = car.products.find(p => p.product.toString() === productID);
  
        // Si el producto ya está, solo se suma la cantidad
        if (existingProduct) {
          existingProduct.cantidad += cantidad;
        } else {
          // Si no está, se agrega al array de productos
          car.products.push({
            product: product._id,
            cantidad
          });
        }
  
        await car.save();
      }
  
      // **Populate user y productos**
      car = await Carrito.findOne({ user })
        .populate("user", "name email")
        .populate("products.product");
  
      // Convertir a objeto plano de js para que incluya los campos virtuales
      const carObject = car.toObject({ virtuals: true });
  
      res.status(200).json({
        message: "Producto agregado al carrito.",
        car: carObject
      });
    } catch (error) {
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
        const carrito = await Carrito.findOne({ user })
            .populate("user", "name email")
            .populate("products.product");

        if (!carrito) {
            return res.status(404).json({
                message: "Carrito no encontrado"
            });
        }

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
          message: `Se ha eliminado ${cantidad} unidades del producto ${productInCart.product.name} del carrito.`,
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