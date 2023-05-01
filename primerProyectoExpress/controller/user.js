/* Importamos el modelo user y el encriptador de contraseñas */
const User = require('../models/user');
const bcryptjs = require('bcryptjs');
const {genJWT} = require('../helpers/genJWT')


/* Añadir un usuario nuevo a la BD */
async function addUser (req, res) {
    
    // Obtenemos los datos
    const { name, email, password, rol } = req.body;
    const newUser = new User({ name, email, password, rol });
    
    //Validar si existe el email
    const emailNoValid = await User.findOne({email});
    if (emailNoValid){
        return res.status(400).json({
            msg: 'El correo ya está registrado'
        });
    }
    
    // Encriptar la contraseña
    const salt = bcryptjs.genSaltSync();
    newUser.password = bcryptjs.hashSync( password, salt );
    
    // Guardar en BD
    await newUser.save();

    // Envía una respuesta en formato JSON
    res.json({
        newUser
    });
}

/* Borra usuario */
async function deleteUser(req,res){
    const id = req.params.id;
    const user = await User.findByIdAndUpdate(id,{"state": false});
    const token = req.user;
    res.json({
        user, 
        token
    });
}


/* Hace login */
async function login(req, res){
    const {email, password} = req.body;
    try {
        const user = await User.findOne({email});
        /* comprueba que el usuario existe */
        if(!user){
            return res.status(400).json({
                mensage:'El usuario no existe'
            });
        }else{
            /* comprueba que está activo */
            if(!user.active){
                return res.status(400).json({
                    msg:'El usuario no esta activo'
                });
            }else{
                const validPassword = bcryptjs.compareSync(password,user.password);
                /* comprueba que la contraseña es correcta */
                if(!validPassword){
                    return res.status(400).json({
                        mensage:'La contraseña no es correcta'
                    });
                }else{
                    //genera el token
                    const token = await genJWT(user._id);
                    res.json({
                        token,
                        msg:'READY!!'});   
                }
            }
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg:'Error inesperado'
        })
    }
}


module.exports = {addUser, deleteUser, login};