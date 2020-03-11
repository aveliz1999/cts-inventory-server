import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import session, {SessionOptions} from 'express-session';
import redis from 'redis';
import {session as sessionConfig, redis as redisConfig} from './config';
import connectRedis from 'connect-redis';

const RedisStore = connectRedis(session);
const redisClient = redis.createClient(redisConfig)

const app = express();

const sessionOptions: SessionOptions = {
    cookie: {
        maxAge: 36,
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

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

import usersRoute from './routes/users';

app.use('/users', usersRoute);

export default app;
