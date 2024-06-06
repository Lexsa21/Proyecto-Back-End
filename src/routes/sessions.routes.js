import { Router } from 'express';
import { __dirname } from '../utils.js';

const routerS = Router();


const adminAuth = (req, res, next) => {
    if (req.session.user.role !== 'admin') return res.status(401).send({ payload: 'Acceso no autorizado: se requiere nivel de admin' });

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


routerS.get('/login', async (req, res) => {
    try {
        // Esto simula datos ingresados desde un formulario
        const email = 'idux.net@gmail.com';
        const password = 'abc123';
        
        // Esto simula datos existentes en base de datos
        const savedNamed = 'Carlos Perren';
        const savedEmail = 'idux.net@gmail.com';
        const savedPassword = 'abc123';
        const savedRole = 'premium';

        if (email !== savedEmail || password !== savedPassword) {
            return res.status(401).send({ payload: 'Datos de acceso no válidos' });
        }
        
        req.session.user = { name: savedNamed, email: email, role: savedRole };
        res.status(200).send({ payload: 'Bienvenido!' });
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