const fs = require('fs-extra');
const path = require("path");

async function addRepo(filePath) {
    const repoPath = path.resolve(process.cwd(), ".nova");
    const stagingPath = path.resolve(repoPath, "staging");

    try {
        await fs.mkdirs(stagingPath);
        const fileName = path.basename(filePath);
        await fs.copy(fileName, path.join(stagingPath, fileName));

        console.log(`${fileName} staged successfully!`);
    } catch(err) {
        console.log("Error adding file:", err);
    }
};

module.exports = { addRepo };