const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bodyParse = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');

const yargs = require('yargs');
const { hideBin } = require("yargs/helpers");

const { initRepo } = require("./controllers/init.js");
const { addRepo } = require("./controllers/add.js");
const { commitRepo } = require("./controllers/commit.js");
const { pushRepo } = require("./controllers/push.js");
const { pullRepo } = require("./controllers/pull.js");
const { revertRepo } = require("./controllers/revert.js");
const bodyParser = require('body-parser');

const mainRouter = require('./routes/main.router.js');

dotenv.config(); //enables .env variables to be used with process

yargs(hideBin(process.argv))
    .command("start", "Start a new server", {}, startServer)
    .command("init", "Initialize a new repository", {}, initRepo)
    .command("add <file>",
        "Add a file to repository",
        (yargs) => {
            yargs.positional("file", {
                describe: "File to add to the staging area",
                type: "string",
            });
        },
        (argv) => {
            addRepo(argv.file);
        })
    .command("commit <message>",
        "Commit the staged files",
        (yargs) => {
            yargs.positional("message", {
                describe: "Commit message",
                type: "string",
            });
        },
        (argv) => {
            commitRepo(argv.message);
        })
    .command("push", "Push commits", {}, pushRepo)
    .command("pull", "Pull commits", {}, pullRepo)
    .command("revert <commitID>",
        "Revert to a specific commit",
        (yargs) => {
            yargs.positional("commitID", {
                describe: "Revert to commit with commit ID",
                type: "string",
            });
        },
        revertRepo)
    .demandCommand(1, "You need to enter atleast one command")
    .parse()

function startServer() {
    const app = express();
    const port = process.env.PORT;
    
    app.use(bodyParser.json());
    app.use(express.json());

    const mongoURL = process.env.MONGO_URL || 3000;
    async function main() {
        await mongoose.connect(mongoURL);
    }

    main()
     .then(() => {
            console.log("MongoDB connected!");
        })
     .catch(err => console.log(err));

    app.use(cors({ origin: "*" }));

    app.use("/", mainRouter);

    let user = "test";
    const httpServer = http.createServer(app);
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        }
    })

    io.on("connection", (socket) => {
        socket.on("joinRoom", (userID) => {
            user = userID,
            console.log("======");
            console.log(user);
            console.log("======");
        });
    });

    const db = mongoose.connection;

    db.once("open", async () => {
        console.log("CRUD operations called");
        // CRUD Operations
    });

    httpServer.listen(port, () => {
        console.log(`app listening to PORT ${port}`);
    });
}
    
    
