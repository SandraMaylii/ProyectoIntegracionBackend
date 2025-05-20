// index.js

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const { exec } = require('child_process');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Conexión a MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'lsp_db'
});

db.connect(err => {
    if (err) {
        console.error('❌ Error de conexión:', err);
        return;
    }
    console.log('✅ Conectado a MySQL');
});

// Registro
app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;
    db.query(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, password],
        (err, result) => {
            if (err) return res.status(500).send({ error: 'Error al registrar' });
            res.send({ message: 'Usuario registrado' });
        }
    );
});

// Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.query(
        'SELECT * FROM users WHERE email = ? AND password = ?',
        [email, password],
        (err, results) => {
            if (err) return res.status(500).send({ error: 'Error en login' });
            if (results.length > 0) res.send({ success: true });
            else res.status(401).send({ message: 'Credenciales inválidas' });
        }
    );
});

// 🔮 Predicción usando modelo en Python
app.post('/api/predict', (req, res) => {
    const keypoints = req.body.keypoints;

    if (!Array.isArray(keypoints)) {
        return res.status(400).send({ error: 'Formato de keypoints inválido' });
    }

    // Serializamos para evitar errores por comillas
    const inputStr = JSON.stringify(keypoints).replace(/'/g, '"');
    const command = `python predict.py '${inputStr}'`;

    exec(command, (err, stdout, stderr) => {
        if (err) {
            console.error('❌ Error ejecutando modelo:', err);
            return res.status(500).send({ error: 'Error al ejecutar modelo' });
        }

        try {
            const output = JSON.parse(stdout);
            if (output.error) {
                return res.status(500).send({ error: output.error });
            }
            res.send({ prediction: output.prediccion });
        } catch (parseError) {
            console.error('❌ Error al parsear salida:', stdout);
            res.status(500).send({ error: 'Salida inválida del modelo' });
        }
    });
});

// Iniciar servidor
app.listen(3001, () => console.log('🚀 Backend corriendo en http://localhost:3001'));
