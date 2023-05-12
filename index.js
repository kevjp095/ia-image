const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT;

// Configuración del middleware para analizar el cuerpo de la solicitud como JSON
app.use(express.json());

// Ruta para la detección de objetos
app.post('/deteccion-objetos', async (req, res) => {
  try {
    const imageUrl = req.body.url; // Obtén la URL de la imagen del cuerpo de la solicitud
    const probabilidad = req.body.probabilidad;

    const apiKey = process.env.APIKEY; // Reemplaza con tu clave de suscripción de Azure

    // Configura la solicitud POST al servicio de Computer Vision
    const visionApiUrl = process.env.CUSTOM_VISION;
    const headers = {
      'Content-Type': 'application/json',
      'Prediction-Key': apiKey
    };
    const data = {
      Url: imageUrl
    };

    // Realiza la solicitud POST al servicio de Computer Vision
    const response = await axios.post(visionApiUrl, data, { headers });

    // Filtrar objetos con porcentaje aceptable

    const threshold = probabilidad || 0.9; // Porcentaje aceptable
    const filteredPredictions = response.data.predictions.filter(prediction => {
      return prediction.probability >= threshold;
    });
    
    // Obtener el nombre de los objetos filtrados
    const objectNames = filteredPredictions.map(prediction => prediction.tagName);
    

    // Devuelve la respuesta filtrada del servicio de Computer Vision
    const filteredResponse = {
      //...response.data,
      objectName: objectNames[0], // Nombre del primer objeto
      objectCount: filteredPredictions.length, // Cantidad de objetos
      predictions: filteredPredictions
    };

    // Devuelve la respuesta del servic io de Computer Vision
    res.json(filteredResponse);

  } catch (error) {
    // Manejo de errores
    console.error(error);
    res.status(500).send(error);
  }
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor Express iniciado en el puerto ${port}`);
});
