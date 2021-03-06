// declare namespace Express{
//     export interface Request{
//         user: any;
//     }
//     export interface Response{
//         user:any
//     }
// };

declare global {
    namespace Express {
      interface Request {
        user: User
      }
    }
  }