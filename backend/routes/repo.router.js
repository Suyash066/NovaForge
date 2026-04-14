const express = require('express');
const repoController = require('../controllers/repoController');

const repoRouter = express.Router();

repoRouter.post("/repo/create", repoController.createRepository);
repoRouter.get("/repo/all", repoController.getAllRepositories);
repoRouter.get("/repo/:repoId", repoController.getRepositoryById);
repoRouter.get("/repo/name/:repoName", repoController.getRepositoryByName);
repoRouter.get("/repo/user/:userId", repoController.getRepositoriesForCurrentUser);
repoRouter.put("/repo/update/:repoId", repoController.updateRepositoryById);
repoRouter.delete("/repo/delete/:repoId", repoController.deleteRepositoryById);
repoRouter.patch("/repo/toggle/:repoId", repoController.toggleVisibilityById);

module.exports = repoRouter;