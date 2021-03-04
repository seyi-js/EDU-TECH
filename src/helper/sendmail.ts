import { sendMail } from './funtions';


export const sendSignUpEmail = async (data: any) => { 
    let input:string
    input = `${data.link}`
    
    data.input = input;
    const response =  await sendMail( data )
      
      return response
}