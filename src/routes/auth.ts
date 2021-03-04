import express, { Application, Request, Response, NextFunction } from 'express';
const Router:any = express.Router();
import {UserModel} from '../models/index'

Router.post('/', (req: Request, res: Response): any => {
    res.send('Hello from auth')
});


export default Router;