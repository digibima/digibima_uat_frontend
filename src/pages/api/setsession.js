import { setCookie } from 'nookies';
import { encryptData } from './crypt'; // Example encryption utility functions

export default async function handler(req, res) {
  const { token } = req.body;
  // console.log('body',req.body);
  // const encryptedToken = await encryptData(token);
  const encryptedToken = token;
  if (encryptedToken) {
    setCookie({ res }, 'unused', encryptedToken, {
      httpOnly: true,     
      secure: true,       
      path: '/',          
      sameSite: 'none',  
      maxAge: 60 * 60 * 24 * 30, 
    });
    res.json({ status: true, message: 'Session set successfully',cookie:encryptedToken });
  }else{
    res.json({ status: false, message: 'Session not set successfully' });
  }


  
}
