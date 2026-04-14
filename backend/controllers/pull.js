const fs = require("fs-extra");
const path = require("path");
const { s3, S3_BUCKET } = require("../config/aws-config");

async function pullRepo() {
    const repoPath = path.resolve(process.cwd(), ".nova");
    const commitsPath = path.join(repoPath, "commits");

    try {
        const data = await s3.listObjectsV2({
            Bucket: S3_BUCKET,
            Prefix: "commits/",
        })
        .promise();

        const objects = data.Contents;

        for(const object of objects) {
            const key = object.Key;
            const commitDir = path.join(
                commitsPath,
                path.dirname(key).split("/").pop(),
            );

            await fs.mkdirs(commitDir);

            const params = {
                Bucket: S3_BUCKET,
                Key: key,
            };

            const fileContent = await s3.getObject(params).promise();
            await fs.writeFile(path.join(repoPath, key), fileContent.Body);

            console.log("Files pulled from S3.");
        }

    } catch(err) {
        console.error("Unable to pull files:", err);
    }
}

module.exports = { pullRepo };