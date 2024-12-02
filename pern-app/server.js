const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config(); // Charge les variables d'environnement

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL pool
const pool = new Pool();

// Test route to check DB connection
app.get('/api/todos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM todos');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.post('/api/todos', async (req, res) => {
    try {
        const { description } = req.body; // Récupère la description envoyée dans le body
        const result = await pool.query(
            'INSERT INTO todos (description) VALUES ($1) RETURNING *',
            [description]
        );
        res.json(result.rows[0]); // Renvoie la tâche ajoutée
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Route pour récupérer une tâche spécifique
app.get('/api/todos/:id', async (req, res) => {
    try {
        const { id } = req.params; // Récupère l'id de l'URL
        const result = await pool.query(
            'SELECT * FROM todos WHERE id = $1',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).send('Tâche non trouvée');
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Route pour mettre à jour une tâche
app.put('/api/todos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { description } = req.body;
        const result = await pool.query(
            'UPDATE todos SET description = $1 WHERE id = $2 RETURNING *',
            [description, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).send('Tâche non trouvée');
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Route pour supprimer une tâche
app.delete('/api/todos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'DELETE FROM todos WHERE id = $1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).send('Tâche non trouvée');
        }
        res.json({ message: 'Tâche supprimée', task: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
