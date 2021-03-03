import express,{Application,Request,Response,NextFunction} from 'express';
const app:Application = express();
const PORT = process.env.PORT || 8080;


import Api from './routes/api';

app.use('/',Api)
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));