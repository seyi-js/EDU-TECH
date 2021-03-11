import express, { Application} from 'express';
import path from 'path';
import mongoose from 'mongoose';
// const mongoose = require('mongoose')
// import helmet from 'helmet';
const helmet = require('helmet')
import Auth from './routes/public_access/auth';
import Admin from './routes/private_access/admin/index';
import Student from './routes/private_access/student/index';
import Courses from './routes/public_access/courses';
mongoose.set( 'useCreateIndex', true );
const app:Application = express();
const PORT = process.env.PORT || 8080;

let db:any;


//Switch Between DB's in Prod
( process.env.NODE_ENV !== 'production' ) ? db = 'mongodb://localhost:27017/edutech' : db = require('./config').mongo_url;

//Connect To Database
const connectToDatabase = async () => {
    try {
        await mongoose.connect(db, { useUnifiedTopology: true, useNewUrlParser: true });

        console.log( 'Connected to Edutech Database' )
    } catch (err) {
        console.log( `Database Connection Error: ${ err }` ) 
    }
}
connectToDatabase();
    
    app.use(
        helmet({
          contentSecurityPolicy: false,
        })
      );
    
      app.use(
          helmet.referrerPolicy({
            policy: ["origin", "unsafe-url"],
          })
        );
    //Body Parser
    app.use(express.json());


app.use('/api/auth', Auth);
app.use('/api/admin', Admin);
app.use('/api/course', Courses);
app.use('/api/student', Student);
app.use(express.static('html'));
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'html', 'index.html'));
})

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));