import { Router } from 'express';
import ProductManager from '../Dao/controllers/Mongo/productManagerMongo.js';
import { __dirname } from "../utils.js"

const pm=new ProductManager()
const routerV = Router()


routerV.get("/",async(req,res)=>{
    const listadeproductos=await pm.getProductsView()
    res.render("home",{listadeproductos})
})

routerV.get("/realtimeproducts",(req,res)=>{
res.render("realtimeproducts")
})



routerV.get("/chat",(req,res)=>{
    res.render("chat")
})


//agregue rutas parte de sessions clase 19
routerV.get('/register', (req, res) => {
    res.render('register', {});
});

routerV.get('/login', (req, res) => {
    // Si hay datos de sesión activos, redireccionamos al perfil
    if (req.session.user) return res.redirect('/profile');
    res.render('login', {});
});

routerV.get('/profile', (req, res) => {
    // Si NO hay datos de sesión activos, redireccionamos al login
    if (!req.session.user) return res.redirect('/login');
    res.render('profile', { user: req.session.user });
});

export default routerV