const fs = require('fs');
const {promisify} = require('util');
const path = require('path');
const baseFilePath = __dirname +"/../Data/";

// Converts a callback-based function to a Promise-based one
const openFileAsync = promisify(fs.open);
const closeFileAsync = promisify(fs.close);
const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);
const readDirAsync = promisify(fs.readdir);
const deleteFileAsync = promisify(fs.unlink);
const getStatusAsync = promisify(fs.stat);
const makeDirAsync = promisify(fs.mkdir);

const DataFile = function(entity, baseDir='../.data') {
    this.baseDir = path.join(__dirname, baseDir);
    this.entity = entity;
    this.createDir();
};

DataFile.prototype.createDir = function () {
    return getStatusAsync(`${this.baseDir}`)
      .catch(() => makeDirAsync(`${this.baseDir}`))
      .then(() => getStatusAsync(`${this.baseDir}/${this.entity}`))
      .catch(() => makeDirAsync(`${this.baseDir}/${this.entity}`))
      .catch(() => {});
  };

// Base of file
DataFile.prototype.getFilePath = function(fileName) { return `${this.baseDir}/${this.entity}/${fileName}.json`; }

// Base directory of data folder
DataFile.prototype.getDir = function() { return `${this.baseDir}/${this.entity}`; }

// Write data to a file
DataFile.prototype.create = async function(fileName, data) {
    const file =  await openFileAsync(this.getFilePath(fileName), 'wx');
    // Write the data in JSON format
    await writeFileAsync(file, JSON.stringify(data));
    // Close the file
    closeFileAsync(file);
    
    return data
}

// Update data in a file
DataFile.prototype.update = async function(fileName, data) {
    const file = await openFileAsync(this.getFilePath(fileName), 'w');
    // Write the data in JSON format
    await writeFileAsync(file, JSON.stringify(data));
    // Close the file
    closeFileAsync(file);
    return data;
}

// Read data from a file
DataFile.prototype.read = async function(fileName) {
    const file = await openFileAsync(this.getFilePath(fileName), 'r');
    // Read the data and save
    const fileData = await readFileAsync(file, 'utf8');
    // Close the file
    await closeFileAsync(file);

    return JSON.parse(fileData);
}

// List all the items in a directory
DataFile.prototype.list = async function() {
    const fileList = await readDirAsync(this.getDir());
    // Remove the extension
    return fileList.map(file => file.trim().replace(/(\..*)$/, ''));
}

// Delete a file
DataFile.prototype.delete = async function(fileName) { return deleteFileAsync(this.getFilePath(fileName)); }

// Export the module
module.exports = DataFile;