import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "El Nombre Es Obligatorio"]
    },
    username: {
        type: String,
        required: [true, "El Nombre De Usuario Es Obligatorio"]
    },
    email:{
        type: String,
        required: [true, "El Correo Es Obligatorio (no te olvides de la @)"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "La Contraseña Es Obligatoria (obvio)"]
    },
    role: {
        type: String,
        required: [true, "El Rol Es Obligatori (leiste)"],
        enum: ["ADMIN_ROLE","USER_ROLE"],
        default: "USER_ROLE"
    },
    estado: {   
        type: Boolean,
        default: true
    }
});


UserSchema.methods.toJSON = function() {
    const {__v, _id, ...usuario} = this.toObject();
    usuario.uid = _id;
    return usuario;
}

export default mongoose.model("User", UserSchema);