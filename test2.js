const express = require('express');
const multer = require('multer');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 5004;
const archiver = require('archiver');
const gltfPipeline = require("gltf-pipeline");
const fsExtra = require("fs-extra");


// Set up Multer to handle file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });
const path = require('path');
let i = 1
// API endpoint for uploading STEP files
app.post('/upload-step', upload.single('stepFile'), async (req, res) => {
    const { init, readStepFile, triangulate, writeGlbFile } = await import('opencascade-tools');

    try {
        const { buffer } = req.file;

        const destinationPath = './uploads/stepFile.step';
        const gltfpath = './gltf/step.glb'



        fs.writeFileSync(destinationPath, buffer);
        console.log('STEP file saved');




        const oc = await init();
        const docHandle = readStepFile(oc, destinationPath);
        triangulate(oc, docHandle.get());
        writeGlbFile(oc, docHandle, gltfpath);

        const glbToGltf = gltfPipeline.glbToGltf;
        const glb = fsExtra.readFileSync("./gltf/step.glb");
        glbToGltf(glb).then(function (results) {
            fsExtra.writeJsonSync("./gltf/step.gltf", results.gltf);
          });


        const gltfFilePath = path.join(__dirname, 'gltf', './step.gltf'); // Create the absolute path

        res.sendFile(gltfFilePath)
        console.log("processed step file count : ", i)
        i++
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred during file processing.' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});