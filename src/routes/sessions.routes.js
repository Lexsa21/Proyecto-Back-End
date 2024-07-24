import { Router } from 'express';
import { __dirname } from '../utils.js';
import { createHash ,isValidPassword, verifyRequiredBody } from '../utils.js';
import UsersManager from '../Dao/controllers/Mongo/users.manager.mdb.js';
import initAuthStrategies from '../auth/passport.strategies.js';

const routerS = Router();
const manager = new UsersManager();
initAuthStrategies();


const verifyAdmin = (req, res, next) => {
    // ?: operador opcional: si no existe el objeto req.session.user o el role no es admin
    if (req.session.user?.role !== 'admin')
        return res.status(403).send({ origin: config.SERVER, payload: 'Acceso no autorizado: se requiere autenticación y nivel de admin' });

    next();
}

/**
 * Este endpoint es solo temporal para poder hashear claves de prueba
 * El método createHash se utiliza al llamar al add del manager (ver ejemplo
 * post /register debajo)
 */
routerS.get('/hash/:password', async (req, res) => {
    res.status(200).send({  payload: createHash(req.params.password) });
});

routerS.post('/register', verifyRequiredBody(['firstName', 'lastName', 'email', 'password']), async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const foundUser = await manager.getOne({ email: email });

        // Si NO se encuentra ya registrado el email, continuamos y creamos
        // un nuevo usuario standard (tipo user)
        if (!foundUser) {
            const process = await manager.add({ firstName, lastName, email, password: createHash(password)});
            res.status(200).send({  payload: process });
        } else {
            res.status(400).send({payload: 'El email ya se encuentra registrado' });
        }
    } catch (err) {
        res.status(500).send({ payload: null, error: err.message });
    }
});

// Endpoint para autenticación "manual" contra base de datos propia
routerS.post('/login', verifyRequiredBody(['email', 'password']), async (req, res) => {
    try {
        /**
         * Tratamos de ubicar un usuario por email, y en caso
         * de existir, comparamos el hash de la password recibida
         * por formulario con el hash de la propiedad password
         * del usuario recuperado. Si todo coincide, continuamos.
         * 
         * Atención!: observar el req.session.save con su callback,
         * para asegurar que se hayan guardado los datos de sesión
         * antes de realizar la redirección.
         */
        const { email, password } = req.body;
        const foundUser = await manager.getOne({ email: email });

        if (foundUser && isValidPassword(password, foundUser.password)) {
            // En lugar de armar req.session.user manualmente, aprovechamos el operador spread (...)
            // para quitar la password del objeto foundUser y utilizar lo demás
            const { password, ...filteredFoundUser } = foundUser;
            // req.session.user = { firstName: foundUser.firstName, lastName: foundUser.lastName, email: email, role: foundUser.role };
            req.session.user = filteredFoundUser;
            req.session.save(err => {
                if (err) return res.status(500).send({ payload: null, error: err.message });

                res.redirect('/profile');
            });
        } else {
            res.status(401).send({ payload: 'Datos de acceso no válidos' });
        }
    } catch (err) {
        res.status(500).send({  payload: null, error: err.message });
    }
});

// Endpoint para autenticación aplicando Passport contra base de datos propia
routerS.post('/pplogin', verifyRequiredBody(['email', 'password']), passport.authenticate('login', { failureRedirect: `/login?error=${encodeURI('Usuario o clave no válidos')}`}), async (req, res) => {
    try {
        // Passport inyecta los datos del done en req.user
        req.session.user = req.user;
        req.session.save(err => {
            if (err) return res.status(500).send({  payload: null, error: err.message });
        
            res.redirect('/profile');
        });
    } catch (err) {
        res.status(500).send({ payload: null, error: err.message });
    }
});

// Endpoint para autenticación aplicando Passport contra servicio externo (Github).
// Probar también otros servicios como Google, Facebook, Microsoft.
// Este endpoint va VACIO, es al cual apuntamos desde la plantilla
// y solo se encarga de redireccionar al servicio externo
routerS.get('/ghlogin', passport.authenticate('ghlogin', {scope: ['user']}), async (req, res) => {
});

// Endpoint al cual retorna Github luego de completar su proceso de autenticación.
// Aquí nos llegará un profile del usuario (si se autenticó correctamente), o se
// redireccionará al failureRedirect
routerS.get('/ghlogincallback', passport.authenticate('ghlogin', {failureRedirect: `/login?error=${encodeURI('Error al identificar con Github')}`}), async (req, res) => {
    try {
        req.session.user = req.user // req.user es inyectado AUTOMATICAMENTE por Passport al parsear el done()
        req.session.save(err => {
            if (err) return res.status(500).send({  payload: null, error: err.message });
        
            res.redirect('/profile');
        });
    } catch (err) {
        res.status(500).send({ payload: null, error: err.message });
    }
});

/**
 * Utilizamos el middleware verifyAdmin (ver arriba) para verificar si el usuario
 * está autenticado (tiene una sesión activa) y es admin
 */
routerS.get('/admin', verifyAdmin, async (req, res) => {
    try {
        res.status(200).send({  payload: 'Bienvenido ADMIN!' });
    } catch (err) {
        res.status(500).send({  payload: null, error: err.message });
    }
});

routerS.get('/logout', async (req, res) => {
    try {
        req.session.destroy(err => {
            if (err) return res.status(500).send({  payload: 'Error al ejecutar logout', error: err });
            res.redirect('/login');
        });
    } catch (err) {
        res.status(500).send({  payload: null, error: err.message });
    }
});

export default routerS;

//como lo tenia antes -----------------------------------------------------------------------------------------------------------------------------------------------

/*
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
/* //aca borrar
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

       /* //aca borrar
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
/* //aca borrar
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
*/