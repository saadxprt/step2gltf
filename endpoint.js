const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const cors = require('cors');
const bodyParser = require('body-parser');
const init = require('opencascade-tools')
const readStepFile = require('opencascade-tools')
const  triangulate = require('opencascade-tools')
const writeGltfFile = require('opencascade-tools')

const multer = require('multer');
const fs = require('fs');
const gltfPipeline = require('gltf-pipeline');
const processGltf = gltfPipeline.processGltf;
const dracoOptions = {
  compressionLevel: 5 // Adjust the compression level as desired (0-10)
};

const app = express();
let i = 0

const port = 5004;
const upload = multer({ dest: 'uploads/', limits: { fileSize: 100000000 } }); // Set the desired file size limit (in bytes)
const corsOptions = {
  origin: ['*,*'],
  allowedHeaders: ['Content-Type', 'Authorization'], // Update to include the necessary headers
};

app.use(cors(corsOptions));

app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

app.use(express.json());

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Gerber',
      version: '1.0.0',
    },
    servers: [
      {
        url: `http://0.0.0.0:${port}`,
      },
    ],
  },
  apis: ['./gerber.js'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.post('/api/step2gltf', upload.single('gltfFile'), async (req, res) => {
  try {
    const oc = await init()

    const gltfFilePath = req.file.path;

    // Read the GLTF file asynchronously
    const gltfData = await fs.promises.readFile(gltfFilePath, 'utf8');
    const docHandle = readStepFile(oc, gltfFilePath)
    // Parse the GLTF JSON
    const gltf = JSON.parse(gltfData);

    // Compress GLTF using Draco
    const compressedGltf = await processGltf(gltf, {
      compressDracoMeshes: true,
      dracoOptions: dracoOptions
    });

    // Convert compressed GLTF to string
    const compressedGltfString = JSON.stringify(compressedGltf);

    // Delete the uploaded GLTF file
    await fs.promises.unlink(gltfFilePath);

    // Set the compressed DracoGLTF as the return value.
    i++
   
    console.log("processed step files : ",i)
    res.send(compressedGltfString);
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).send('An error occurred');
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Swagger API documentation is available at http://localhost:${port}/api-docs, this is only for compression`);
}); 