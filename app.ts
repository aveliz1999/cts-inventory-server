import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import session, {SessionOptions} from 'express-session';
import redis from 'redis';
import {session as sessionConfig, redis as redisConfig} from './config/index';
import connectRedis from 'connect-redis';

const RedisStore = connectRedis(session);
const redisClient = redis.createClient(redisConfig)

const app = express();

const sessionOptions: SessionOptions = {
    cookie: {
        maxAge: 3600000,
        httpOnly: false
    },
    name: 'sessId',
    saveUninitialized: true,
    secret: sessionConfig.sessionSecrets,
    resave: true,
    rolling: true,
    store: new RedisStore({client: redisClient})
}
if (app.get('env') === 'production') {
    app.set('trust proxy', 1);
    sessionOptions.cookie.secure = true;
}
app.use(session(sessionOptions));

const env = process.env.NODE_ENV || 'development';
if (env === 'development') {
    app.use(logger('dev'));
}
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

import usersRoute from './routes/users';
import inventoryRoute from './routes/inventory';
import qrRoute from './routes/qr';

app.use('/users', usersRoute);
app.use('/inventory', inventoryRoute);
app.use('/qr', qrRoute);

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError) {
        res.status(400).send({message: err.message});
    } else {
        console.error(err);
        res.status(500).send({message: 'An error occurred on the server'});
    }
});

export default app;
