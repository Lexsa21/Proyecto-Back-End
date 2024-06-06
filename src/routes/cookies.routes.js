import { Router } from 'express';
import { __dirname } from '../utils.js';


const routerC = Router();

routerC.get('/getcookies', async (req, res) => {
    try {

        const data = JSON.parse(req.signedCookies['codercookie']);
        
        res.status(200).send({  payload: data });
    } catch (err) {
        res.status(500).send({  payload: null, error: err.message });
    }
});

routerC.get('/setcookie', async (req, res) => {
    try {

        const cookieData = { user: 'axel', email: 'idux.net@gmail.com' };
        res.cookie('codercookie',JSON.stringify(cookieData) , { maxAge: 30000, signed: true });
        
        res.status(200).send({  payload: 'Cookie generada' });
    } catch (err) {
        res.status(500).send({  payload: null, error: err.message });
    }
});

routerC.get('/deletecookie', async (req, res) => {
    try {
        res.clearCookie('codercookie');
        res.status(200).send({ origin: config.SERVER, payload: 'Cookie eliminada' });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});

export default routerC;