const express = require('express');
const AWS = require('aws-sdk');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

// Configurar AWS DynamoDB
AWS.config.update({
region: 'us-east-2',
});

const docClient = new AWS.DynamoDB.DocumentClient();

// Ruta: Obtener los 3 mejores jugadores por puntaje
app.get('/api/top3', async (req, res) => {
const params = {
    TableName: 'Jugadores',
};

try {
    const data = await docClient.scan(params).promise();
    const jugadoresOrdenados = data.Items
    .sort((a, b) => b.puntos - a.puntos)
    .slice(0, 3)
    .map(j => ({
        ...j,
        imagenUrl: `https://jugadores-imagenes.s3.us-east-2.amazonaws.com/jugadores/${j.cedula}${[72518456, 76382910, 80918273, 81927344].includes(j.cedula) ? '.jpeg' : '.jpg'}`,
    }));

    res.json(jugadoresOrdenados);
} catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener jugadores' });
}
});

// Ruta: Ganador aleatorio (último torneo simulado)
app.get('/api/ganador', async (req, res) => {
const params = {
    TableName: 'Jugadores',
};

try {
    const data = await docClient.scan(params).promise();
    const random = data.Items[Math.floor(Math.random() * data.Items.length)];

    res.json({
    ...random,
    imagenUrl: `https://jugadores-imagenes.s3.us-east-2.amazonaws.com/jugadores/${random.cedula}${[72518456, 76382910, 80918273, 81927344].includes(random.cedula) ? '.jpeg' : '.jpg'}`,
    });
} catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener ganador' });
}
});

// Ruta: Top 5 para la tabla
app.get('/api/top5', async (req, res) => {
const params = {
    TableName: 'Jugadores',
};

try {
    const data = await docClient.scan(params).promise();
    const top5 = data.Items
    .sort((a, b) => b.puntos - a.puntos)
    .slice(0, 5);
    res.json(top5);
} catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener top 5' });
}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
