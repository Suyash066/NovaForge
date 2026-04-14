const fs = require('fs-extra');
const path = require("path");

async function initRepo() {
    const repoPath = path.resolve(process.cwd(), ".nova");
    const commitsPath = path.resolve(repoPath, "commits");
    const configPath = path.resolve(repoPath, "config.json");

    try {
        await fs.mkdirs(repoPath);
        await fs.mkdirs(commitsPath);
        await fs.writeJson(configPath, 
            { bucket: process.env.S3_BUCKET }
        );

        console.log('Repository initialized');
    } catch (err) {
        console.error("Error initialiazing repository", err);
    }
}

module.exports = { initRepo };