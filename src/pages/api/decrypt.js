import { decryptData } from "./crypt";
export default async function handler(req, res) {
  const data = req.body();
  if (data) {
    const decrypted = decryptData(data);
    // console.log("Decrypted Token:", decrypted);
    res.status(200).json({ data: decrypted });
  } else {
    res.status(404).json({ error: "Token not found" });
  }
}
