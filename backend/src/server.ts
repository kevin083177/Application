import express from 'express';
import cors from 'cors';
import { logger } from './middlewares/log';
import { registerSocketHandlers } from './sockets/handler';
import path from 'path';
import { MongoDB } from './utils/MongoDB';

require('dotenv').config();

const http = require('http');
const socket = require('socket.io');

const app: express.Application = express();
const server = http.createServer(app);

export const DB = new MongoDB({
  name:process.env.DBUSER as string,
  password:process.env.DBPASSWORD as string,
  host:process.env.DBHOST as string,
  dbName:process.env.DBNAME as string
});

app.use(cors({
  "origin": "*",
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  "optionsSuccessStatus": 200,
  "exposedHeaders": ['Content-Disposition'],
  "preflightContinue": false,
}));

app.use(express.json({limit:'50mb'}));
app.use(express.urlencoded({ extended: false }))

const io = socket(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

registerSocketHandlers(io);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/test.html'));
});

async function startServer() {
  await DB.connect(); 

  server.listen(process.env.PORT, () => {
    logger.info('listening on *:'+ process.env.PORT);
  });
}

startServer();