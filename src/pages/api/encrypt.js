import { encryptData } from './crypt';
export default async function handler(req, res) {
  const data = req.body()
  if (data) {
    const encrypted = encryptData(data); 
    // console.log('Decrypted:', encrypted);
    res.status(200).json({ data: encrypted });
  } else {
    res.status(404).json({ error: 'Token not found' });
  }
}