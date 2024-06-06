import { Router } from 'express';
import { __dirname } from '../utils.js';

const routerS = Router();


const adminAuth = (req, res, next) => {
    // ?: operador opcional: si no existe el objeto req.session.user o el role no es admin
    // if (!req.session.user || req.session.user.role !== 'admin')
    if (req.session.user?.role !== 'admin')
        return res.status(401).send({ origin: config.SERVER, payload: 'Acceso no autorizado: se requiere autenticación y nivel de admin' });

    next();
}

routerS.get('/counter', async (req, res) => {
    try {

        if (req.session.counter) {
            req.session.counter++;
            res.status(200).send({ payload: `Visitas: ${req.session.counter}` });
        } else {
            req.session.counter = 1;
            res.status(200).send({  payload: 'Bienvenido, es tu primer visita!' });
        }
    } catch (err) {
        res.status(500).send({  payload: null, error: err.message });
    }
});


routerS.post('/register', async (req, res) => {
    //borre el codigo porque acabo de ver un error en el login, para no traer problemas soluciono lo otro primero y despues vuelvo a ponerlo
    /*
        const { first_name, last_name, email, age, password } = req.body;

    try {
        const existingUser = await userModel.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const newUser = new userModel({
            first_name,
            last_name,
            email, 
            age, 
            password
        });

        await newUser.save();
        res.status(201).send('User created');
    } catch (error) {
        res.status(500).json({ message: "Error registering user" });
        console.error("Error registering user:", error);
    }     
    
    */
});

routerS.post('/login', async (req, res) => {
    try {
        // Recuperamos los campos que llegan del formulario
        // Aquí luego se deberían agregar otras validaciones
        const { email, password } = req.body;
        
        const savedFirstName = 'Franco';
        const savedLastName = 'Rodriguez';
        const savedEmail = 'francoR@gmail.com';
        const savedPassword = 'abc123';
        const savedRole = 'admin';

        if (email !== savedEmail || password !== savedPassword) {
            return res.status(401).send({ payload: 'Datos de acceso no válidos' });
        }
        
        req.session.user = { firstName: savedFirstName, lastName: savedLastName, email: email, role: savedRole };
        // res.status(200).send({ origin: config.SERVER, payload: 'Bienvenido!' });
        // res.redirect nos permite redireccionar a una plantilla en lugar de devolver un mensaje
        res.redirect('/profile');
    } catch (err) {
        res.status(500).send({ payload: null, error: err.message });
    }
});


routerS.get('/private', adminAuth, async (req, res) => {
    try {
        res.status(200).send({ payload: 'Bienvenido ADMIN!' });
    } catch (err) {
        res.status(500).send({ payload: null, error: err.message });
    }
});

// Limpiamos los datos de sesión
routerS.get('/logout', async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) return res.status(500).send({ payload: 'Error al ejecutar logout', error: err });
            res.status(200).send({ payload: 'Usuario desconectado' });
        });
    } catch (err) {
        res.status(500).send({ payload: null, error: err.message });
    }
});

export default routerS;