import mongoose from 'mongoose';
import Grid from 'gridfs-stream'
const path = require('path');
import  GridFsStorage from 'multer-gridfs-storage' ;
import multer from 'multer';
import crypto from 'crypto'
mongoose.set('useCreateIndex', true);

let db:any;


//Switch Between DB's in Prod
( process.env.NODE_ENV !== 'production' ) ? db = 'mongodb://localhost:27017/edutech' : db = require('./config').mongo_url;
export let gfs;
//Connect To Database
const connectToDatabase = async () => {
    try {
        //GridFs connection
        let connection = await mongoose.connect( db, { useUnifiedTopology: true, useNewUrlParser: true } );
        Grid.mongo = mongoose.mongo;
        console.log( 'Connected to Edutech Database' );
        gfs = Grid( connection.connection.db);
          gfs.collection( 'uploads' );

    } catch (err) {
        console.log( `Database Connection Error: ${ err }` ) 
    }
}
connectToDatabase();

//Multer Upload
const storage = new GridFsStorage( {
    url: db,
    file: ( req, file ) => {
        // console.log(req)
        return new Promise( ( resolve, reject ) => {
            crypto.randomBytes( 16, ( err, buff ) => {
                if ( err ) {
                    console.log( err )
                }
                
                const filename = buff.toString( 'hex' ) + path.extname( file.originalname );
                const fileInfo = {
                    filename,
                    bucketName: 'uploads'
                };
                resolve( fileInfo )
            } )
        } );
    }
} );

export const  upload = multer({ storage });
