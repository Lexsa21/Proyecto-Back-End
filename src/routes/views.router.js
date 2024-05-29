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


export default routerV