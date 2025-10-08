const express = require('express');
const app = express();
const cors = require('cors');
const fetch = require('node-fetch');
const PORT = 3000;

app.use(cors());
app.use(express.json());

const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqamRycHFya2N4aWZ3b3V5a3NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NDc3NzgsImV4cCI6MjA3NDIyMzc3OH0.EX9qmKTVf1lLfvd6TZc0ZtK7jaZXbuijMzsFVe2Tw5g";

app.get('/traerLista', async (req, res) => {
  const myHeaders = {
    "apikey": SUPABASE_API_KEY,
    "Content-Type": "application/json"
  };

  const requestOptions = {
    method: "GET",
    headers: myHeaders
  };

  try {
    const response = await fetch("https://gjjdrpqrkcxifwouyksh.supabase.co/rest/v1/Productos?select=*", requestOptions);
    const result = await response.json();
    res.json(result);
  } catch (error) {
      res.status(500).json({ error: 'Error del servidor' });
  }
});

app.post('/login', async (req, res) => {
  const { usuario, clave } = req.body;

  const myHeaders = {
    "apikey": SUPABASE_API_KEY,
    "Content-Type": "application/json"
  };

  const requestOptions = {
    method: "GET",
    headers: myHeaders
  };

  try {
    const response = await fetch('https://gjjdrpqrkcxifwouyksh.supabase.co/rest/v1/usuarios?select=*', requestOptions);
    const result = await response.json();

    const usuarioValido = Array.isArray(result) && result.find(
      u => u.usuario === usuario && u.pass === clave
    );

    if (usuarioValido) {
      res.status(200).json({ success: true, user: usuarioValido });
    } else {
      res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
    }
  } catch (error) {
      res.status(500).json({ success: false, message: 'Error al conectar con el servidor' });
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
}

module.exports = app;
