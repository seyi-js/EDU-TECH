import express, { Application, Request, Response, NextFunction } from 'express';
const Router:any = express.Router();


Router.get('/', (req: Request, res: Response): any => {
    res.send('Hello')
});


export default Router;