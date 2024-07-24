// pages/api/send-message.js
import axios from "axios";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      // Mengirimkan POST request menggunakan Axios
      const response = await axios.post(
        "http://localhost:9000/send-message",
        req.body
      );

      // Mengembalikan respons dari server lain
      res.status(200).json(response.data);
    } catch (error) {
      // Menangani error jika gagal mengirim pesan
      res.status(500).json({ error: error.message });
    }
  } else {
    // Menangani jika method selain POST diterima
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} tidak diizinkan.`);
  }
}
