import { Router } from 'express';
import { __dirname } from '../utils.js';
import { createHash ,isValidPassword } from '../utils.js';
import UsersManager from '../Dao/controllers/Mongo/users.manager.mdb.js';

const routerS = Router();
const manager = new UsersManager();


const adminAuth = (req, res, next) => {
    // ?: operador opcional: si no existe el objeto req.session.user o el role no es admin
    // if (!req.session.user || req.session.user.role !== 'admin')
    if (req.session.user?.role !== 'admin')
        return res.status(403).send({  payload: 'Acceso no autorizado: se requiere autenticación y nivel de admin' });
        //fijarme que cuando cambio el rol de admin a usuario me tira que no esta definido (1:46:00 clase 19 mismo error con el profe)
    next();
}

routerS.get('/hash/:password', async (req, res) => {
    res.status(200).send({ payload: createHash(req.params.password) });
});

/*
routerS.post('/register', async (req, res) => {
        //comente el codigo  para no traer problemas con la implementacion de la clase 20 y 21
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
});
*/
// Esto es como tenia antes con los datos hardcodeados
routerS.post('/login', async (req, res) => {
    try {

        const { email, password } = req.body;
        /*
        const savedFirstName = 'Franco';
        const savedLastName = 'Rodriguez';
        const savedEmail = 'francoR@gmail.com';
        const savedPassword = 'abc123';
        const savedRole = 'admin';
        */
        const foundUser = await manager.getOne({ email: email });
        if (foundUser && isValidPassword(password, foundUser.password)) {
            req.session.user = { firstName: foundUser.firstName, lastName: foundUser.lastName, email: email, role: foundUser.role };
            res.redirect('/profile');
        }else{
            return res.status(401).send({ payload: 'Datos de acceso no válidos' });
        }
    } catch (err) {
        res.status(500).send({ payload: null, error: err.message });
    }
});

/*
routerS.post('/login', verifyRequiredBody(['email', 'password']), async (req, res) => {
    try {

        const { email, password } = req.body;
        const foundUser = await manager.getOne({ email: email });

        if (foundUser && isValidPassword(password, foundUser.password)) {

            const { password, ...filteredFoundUser } = foundUser;
            // req.session.user = { firstName: foundUser.firstName, lastName: foundUser.lastName, email: email, role: foundUser.role };
            req.session.user = filteredFoundUser;
            req.session.save(err => {
                if (err) return res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });

                res.redirect('/profile');
            });
        } else {
            res.status(401).send({ origin: config.SERVER, payload: 'Datos de acceso no válidos' });
        }
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});
*/

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
            if (err) return res.status(500).send({ origin: config.SERVER, payload: 'Error al ejecutar logout', error: err });
            // res.status(200).send({ origin: config.SERVER, payload: 'Usuario desconectado' });
            res.redirect('/login');
        });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});

export default routerS;