const { exec } = require('child_process');

const stepFilePath = '7.step'; // Replace with your input .step file path

// Construct the command to convert the .step file to .gltf
const command = `opencascade-tools --format gltf ${stepFilePath}`;

// Execute the command
exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`Conversion successful. Output saved to ${stepFilePath}`);
});