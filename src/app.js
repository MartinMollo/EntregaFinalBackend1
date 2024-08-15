import express, { json, urlencoded } from 'express';
import configureProductsRouter from './routes/products.router.js';
import configureCartsRouter from './routes/carts.router.js';
import handlebars from 'express-handlebars';
import path from 'path';
import { Server } from 'socket.io';
import http from 'http';
import viewsRouter from './routes/views.router.js';
import userRouter from './routes/user.router.js';
import __dirname from './utils/utils.js';
import mongoose from 'mongoose';

const app = express();
const PORT = 8080;

mongoose.connect("mongodb+srv://MartinMollo:UGRxmNecyyGe2oSM@cluster0.uh9cf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => {
    console.log("DDBB connect");
  })
  .catch(error => {
    console.error("Connection error", error);
  });

// Middlewares 
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Handlebars
app.engine('handlebars', handlebars.engine());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

// HTTP
const httpServer = http.createServer(app);

// Socket.IO
const io = new Server(httpServer);

io.on('connection', socket => {
  console.log("Nuevo cliente conectado");

  socket.on('info', data => {
    console.log(`la data nueva es ${data}`);
  });

  socket.on('productData', data => {
    console.log('Product data received:', data);
    io.emit('productData', data);
  });

  socket.on('removeProduct', data => {
    console.log('Remove product:', data);
    io.emit('productRemoved', data);
  });
});

// Routers
app.use("/api/carts", configureCartsRouter(io));
app.use("/api/products", configureProductsRouter(io));
app.use("/api/users", userRouter);
app.use("/", viewsRouter);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});