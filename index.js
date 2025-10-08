const express = require('express');
const app = express();
const cors = require('cors');

// Importa node-fetch para asegurar su disponibilidad,
// incluso si el entorno de Vercel no lo tiene como nativo.
const fetch = require('node-fetch');

const PORT = 3000;

app.use(cors());
app.use(express.json());

const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqamRycHFya2N4aWZ3b3V5a3NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NDc3NzgsImV4cCI6MjA3NDIyMzc3OH0.EX9qmKTVf1lLfvd6TZc0ZtK7jaZXbuijMzsFVe2Tw5g";
const SUPABASE_URL = "https://gjjdrpqrkcxifwouyksh.supabase.co";

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
    const response = await fetch(`${SUPABASE_URL}/rest/v1/Productos?select=*`, requestOptions);
    if (!response.ok) {
      throw new Error(`Error de Supabase: ${response.status} ${response.statusText}`);
    }
    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.error('Error en traerLista:', error);
    res.status(500).json({ error: 'Error del servidor al obtener productos' });
  }
});

app.post('/login', async (req, res) => {
  const { usuario, clave } = req.body;

  if (!usuario || !clave) {
      return res.status(400).json({ success: false, message: 'Usuario y clave son requeridos' });
  }

  const myHeaders = {
    "apikey": SUPABASE_API_KEY,
    "Content-Type": "application/json"
  };

  // Uso de un filtro en la URL para mayor eficiencia y seguridad
  const loginUrl = `${SUPABASE_URL}/rest/v1/usuarios?select=*&usuario=eq.${encodeURIComponent(usuario)}&pass=eq.${encodeURIComponent(clave)}`;
  
  const requestOptions = {
    method: "GET",
    headers: myHeaders
  };

  try {
    const response = await fetch(loginUrl, requestOptions);
    if (!response.ok) {
        throw new Error(`Error de Supabase: ${response.status} ${response.statusText}`);
    }
    const result = await response.json();

    if (result && result.length > 0) {
      res.status(200).json({ success: true, user: result[0] });
    } else {
      res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
    }
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ success: false, message: 'Error al conectar con el servidor' });
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
}

module.exports = app;
