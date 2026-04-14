const fs = require('fs-extra');
const path = require("path");
const { v4: uuidv4 } = require('uuid');

async function commitRepo(message) {
    const repoPath = path.resolve(process.cwd(), ".nova");
    const stagedPath = path.resolve(repoPath, "staging");
    const commitPath = path.resolve(repoPath, "commits");

    try {
        const commitID = uuidv4();
        const commitDir = path.join(commitPath, commitID);
        await fs.mkdirs(commitDir);

        const files = await fs.readdir(stagedPath);
        if (files.length === 0) {
            console.log("Nothing to commit");
            return;
        }

        for (const file of files) {
            await fs.copy(
                path.join(stagedPath, file),
                path.join(commitDir, file)
            );
        }

        await fs.writeJSON(
            path.join(commitDir, "commit.json"),
            {
                id: commitID,
                message: message,
                date: new Date().toISOString(),
            }
        );

        console.log(`Commit ${commitID} created with message: ${message}`);
    } catch (err) {
        console.error("Error commiting file:", err);
    }
}

module.exports = { commitRepo };