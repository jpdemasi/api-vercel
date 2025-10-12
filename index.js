const express = require('express');
const app = express();
const cors = require('cors');
const fetch = require('node-fetch');

const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqamRycHFya2N4aWZ3b3V5a3NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NDc3NzgsImV4cCI6MjA3NDIyMzc3OH0.EX9qmKTVf1lLfvd6TZc0ZtK7jaZXbuijMzsFVe2Tw5g";
const SUPABASE_URL = "https://gjjdrpqrkcxifwouyksh.supabase.co";

const getSupabaseHeaders = (method = 'GET') => {
    const headers = {
        "apikey": SUPABASE_API_KEY,
        "Content-Type": "application/json",
    };

    if (method === 'POST' || method === 'PATCH') {
        headers['Prefer'] = 'return=representation';
    }
    return headers;
};

app.post('/login', async (req, res) => {
    const { usuario, clave } = req.body;

    if (!usuario || !clave) {
        return res.status(400).json({ success: false, message: 'Usuario y clave son requeridos' });
    }

    const loginUrl = `${SUPABASE_URL}/rest/v1/usuarios?select=*&usuario=eq.${encodeURIComponent(usuario)}&pass=eq.${encodeURIComponent(clave)}`;

    try {
        const response = await fetch(loginUrl, { method: "GET", headers: getSupabaseHeaders() });
        const result = await response.json();

        if (result && result.length > 0) {
            res.status(200).json({
                success: true,
                user: result[0],
                message: 'Inicio de sesión exitoso'
            });
        } else {
            res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
        }
    } catch (error) {
        console.error("Error en /login:", error);
        res.status(500).json({ error: 'Error del servidor al iniciar sesión' });
    }
});

app.post('/transacciones', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'ID de usuario es requerido para obtener transacciones.' });
    }

    const transaccionesUrl = `${SUPABASE_URL}/rest/v1/Transacciones?select=*,id_categoria(*),id_metodo_pago(*)&user_id=eq.${userId}&order=fecha.desc`;

    try {
        const response = await fetch(transaccionesUrl, { method: "GET", headers: getSupabaseHeaders() });
        const result = await response.json();
        
        if (response.ok) {
            const transaccionesFormateadas = result.map(t => ({
                id: t.id,
                monto: t.monto,
                descripcion: t.descripcion,
                fecha: t.fecha,
                nombre_categoria: t.id_categoria ? t.id_categoria.nombre : 'Sin Categoría',
                id_categoria: t.id_categoria ? t.id_categoria.id : null,
                nombre_metodo_pago: t.id_metodo_pago ? t.id_metodo_pago.nombre : 'Sin Método',
                id_metodo_pago: t.id_metodo_pago ? t.id_metodo_pago.id : null,
            }));

            res.status(200).json(transaccionesFormateadas);
        } else {
            res.status(response.status).json({ error: result.message || 'Error al consultar transacciones.' });
        }
    } catch (error) {
        console.error("Error en /transacciones:", error);
        res.status(500).json({ error: 'Error del servidor al obtener transacciones' });
    }
});

app.post('/transacciones/crear', async (req, res) => {
    const transactionData = req.body;

    if (!transactionData.user_id || !transactionData.monto || !transactionData.descripcion) {
        return res.status(400).json({ error: 'Faltan campos obligatorios para crear la transacción.' });
    }

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/Transacciones`, {
            method: 'POST',
            headers: getSupabaseHeaders('POST'),
            body: JSON.stringify(transactionData),
        });

        const result = await response.json();

        if (response.ok && result.length > 0) {
            res.status(201).json({ success: true, transaccion: result[0], message: 'Transacción creada exitosamente.' });
        } else {
            res.status(400).json({ error: result.message || 'Error al crear la transacción en Supabase.' });
        }
    } catch (error) {
        console.error("Error en /transacciones/crear:", error);
        res.status(500).json({ error: 'Error del servidor al crear la transacción.' });
    }
});

// NUEVO ENDPOINT PARA ACTUALIZAR (PATCH) - Corregido para que coincida con el frontend
app.patch('/transacciones/actualizar', async (req, res) => {
    const { id, ...updateData } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'ID de transacción es requerido para actualizar.' });
    }

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/Transacciones?id=eq.${id}`, {
            method: 'PATCH',
            headers: getSupabaseHeaders('PATCH'),
            body: JSON.stringify(updateData),
        });

        const result = await response.json();

        if (response.ok && result.length > 0) {
            res.status(200).json({ success: true, transaccion: result[0], message: 'Transacción actualizada exitosamente.' });
        } else if (response.ok && result.length === 0) {
            res.status(404).json({ error: 'No se encontró la transacción con el ID proporcionado.' });
        } else {
            res.status(400).json({ error: result.message || 'Error al actualizar la transacción en Supabase.' });
        }
    } catch (error) {
        console.error("Error en /transacciones/actualizar:", error);
        res.status(500).json({ error: 'Error del servidor al actualizar la transacción.' });
    }
});

// NUEVO ENDPOINT PARA ELIMINAR (DELETE) - Corregido para que coincida con el frontend
app.delete('/transacciones/:id', async (req, res) => {

    console.log("🔍 DELETE recibido con ID:", req.params.id); 
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'ID de transacción es requerido para eliminar.' });
    }

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/Transacciones?id=eq.${id}`, {
            method: 'DELETE',
            headers: getSupabaseHeaders('DELETE'),
        });

        if (response.ok) {
            res.status(200).json({ success: true, message: 'Transacción eliminada exitosamente.' });
        } else {
            const result = await response.json();
            res.status(400).json({ error: result.message || 'Error al eliminar la transacción en Supabase.' });
        }
    } catch (error) {
        console.error("Error en /transacciones/:id:", error);
        res.status(500).json({ error: 'Error del servidor al eliminar la transacción.' });
    }
});


app.get('/categorias', async (req, res) => {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/Categorias?select=*`, { method: "GET", headers: getSupabaseHeaders() });
        const result = await response.json();
        
        if (response.ok) {
            res.status(200).json(result);
        } else {
            res.status(response.status).json({ error: result.message || 'Error al consultar categorías.' });
        }
    } catch (error) {
        console.error("Error en /categorias:", error);
        res.status(500).json({ error: 'Error del servidor al obtener categorías.' });
    }
});

app.get('/metodos_pago', async (req, res) => {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/Metodos_Pago?select=*`, { method: "GET", headers: getSupabaseHeaders() });
        const result = await response.json();
        
        if (response.ok) {
            res.status(200).json(result);
        } else {
            res.status(response.status).json({ error: result.message || 'Error al consultar métodos de pago.' });
        }
    } catch (error) {
        console.error("Error en /metodos_pago:", error);
        res.status(500).json({ error: 'Error del servidor al obtener métodos de pago.' });
    }
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
}

module.exports = app;
