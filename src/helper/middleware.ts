import jwt from 'jsonwebtoken';
import { privateKey } from '../config';
import {UserModel} from '../models/index'
import express, { Application, Request, Response, NextFunction } from 'express';
//@desc Verify Json Web Tokens

export const verifyToken =  ( req:Request, res:Response, next:NextFunction ) => {
    const token = req.header( 'x-auth-token' );
    if ( !token ) {
        
        return res.json({message:'No token, authorization denied', code:401}  )
    } else {
        if ( token ) {
            try {
                const decoded = jwt.verify( token, privateKey );
                req.user = decoded;
                // decoded;
                // console.log( decoded )
                next();
            } catch ( e ) {
                // req.JWTerrorMessage = e.message;
               console.log(e)
        return res.json({message:'Invalid Token', code:403}  )

                
            }
        }
    }
};

//@desc verfiyAdmin
export const verifyAdmin = async ( req:Request, res:Response, next:NextFunction ) => {

    try {
        let user:any = await UserModel.findById(req.user.id);
        if ( user.isAdmin ) {
            next();

            } else {
                return res.json({message:'You are not authorized to access this endpoint.', code:401}  )

        };
    } catch (err) {
        console.log( err )
        return res.json({message:'Internal server error', code:500}  )
    };
 
};