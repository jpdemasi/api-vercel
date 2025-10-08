const express = require('express');

const app = express();

const cors = require('cors');

const PORT = 3000;


app.use(cors());

app.use(express.json());


const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqamRycHFya2N4aWZ3b3V5a3NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NDc3NzgsImV4cCI6MjA3NDIyMzc3OH0.EX9qmKTVf1lLfvd6TZc0ZtK7jaZXbuijMzsFVe2Tw5g"; // tu clave completa


app.get('/traerLista', async (req, res) => {

  const myHeaders = {

    "apikey": API_KEY,

    "Content-Type": "application/json"

  };


  const requestOptions = {

    method: "GET",

    headers: myHeaders,

    redirect: "follow"

  };


  try {

    const response = await fetch("https://gjjdrpqrkcxifwouyksh.supabase.co/rest/v1/Productos?select=*", requestOptions);

    const result = await response.json();

    res.json(result);

  } catch (error) {

    console.error('Error en traerLista:', error);

  }

});


if (process.env.NODE_ENV !== 'production') {

  app.listen(PORT, () => {

    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);

  });

}


module.exports = app;
