import express, { Application} from 'express';
import path from 'path';

// const mongoose = require('mongoose')
// import helmet from 'helmet';
import helmet from 'helmet'
import Auth from './routes/public_access/auth';
import Admin from './routes/private_access/admin/index';
import Student from './routes/private_access/student/index';
import Instructor from './routes/private_access/instructor/index';
import Courses from './routes/public_access/courses';
const dbConnection = require('./dbConnection')
const app:Application = express();
const PORT = process.env.PORT || 8080;


    
app.use(helmet.xssFilter());
app.use(helmet.hidePoweredBy());
    
    //   app.use(
    //       helmet.referrerPolicy({
    //         policy: ["origin", "unsafe-url"],
    //       })
    //     );
   //Body Parser

app.use( express.json(  ) );


app.use('/api/auth', Auth);
app.use('/api/admin', Admin);
app.use('/api/course', Courses);
app.use('/api/student', Student);
app.use('/api/instructor', Instructor);
app.use(express.static('html'));
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'html', 'index.html'));
})

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));