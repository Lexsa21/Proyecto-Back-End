import express from "express"
import { SECRET, __dirname } from "./utils.js"
import handlebars from "express-handlebars"
import {Server} from "socket.io"
import cookieParser from "cookie-parser"

import routerP from "./routes/products.router.js";
import routerV from "./routes/views.router.js";
import routerC from "./routes/cookies.routes.js";

import socketProducts from "./listeners/socketProducts.js";
import socketChat from "./listeners/socketChat.js";
import connectToDB from "./Dao/config/configServer.js";



const app = express()
const PORT=3000

app.use(express.static(__dirname + "/public"))
app.use(cookieParser(SECRET))

//handlebars
app.engine("handlebars",handlebars.engine())
app.set("views", __dirname+"/views")
app.set("view engine","handlebars")

//rutas
app.use("/api",routerP)
app.use('/', routerV);
app.use('/api/cookies', routerC)

connectToDB()

const httpServer= app.listen(PORT, () => {
    try {
        console.log(`Listening to the port ${PORT}\nAcceder a:`);
        console.log(`\t1). http://localhost:${PORT}/api/products`)
        console.log(`\t2). http://localhost:${PORT}/api/carts`);
    }
    catch (err) {
        console.log(err);
    }
});



const socketServer = new Server(httpServer)

socketProducts(socketServer)
socketChat(socketServer)