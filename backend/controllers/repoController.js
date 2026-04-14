const Repository = require('../models/repoModel');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const createRepository = async (req, res) => {
    try {
        const { owner, repositoryName, description, content, issues, visibility } = req.body;

        if (!repositoryName) {
            return res.status(400).json({ error: "Repository name is required!" });
        }

        if (!mongoose.Types.ObjectId.isValid(owner)) {
            return res.status(400).json({ error: "Invalid User ID!" });
        }

        const newRepository = new Repository({
            name: repositoryName,
            description,
            content,
            visibility,
            owner,
            issues
        });

        await newRepository.save();
        res.status(201).json({
            message: "Repository created!",
            repositoryId: newRepository._id
        });
    } catch (err) {
        console.error("Error creating Repository:", err.message);
        res.status(500).send("Server error");
    }
}

const getAllRepositories = async (req, res) => {
    try {
        const repositories = await Repository.find({})
            .populate("owner")
            .populate("issues");

        res.json(repositories);
    } catch (err) {
        console.error("Error fetching Repositories:", err.message);
        res.status(500).send("Server error");
    }
}

const getRepositoryById = async (req, res) => {
    const { repoId } = req.params;

    try {
        const repository = await Repository.findById(repoId).populate("owner").populate("issues");

        if (!repository) {
            return res.status(400).json({ error: "Repository not found!" });
        }

        res.json(repository);
    } catch (err) {
        console.error("Error during fetching repository:", err.message);
        res.status(500).send("Server error");
    }
}

const getRepositoryByName = async (req, res) => {
    const { repoName } = req.params;

    try {
        const repository = await Repository.find({ name: repoName }).populate("owner").populate("issues");

        if (!repository) {
            return res.status(400).json({ error: "Repository not found!" });
        }

        res.json(repository);
    } catch (err) {
        console.error("Error during fetching repository:", err.message);
        res.status(500).send("Server error");
    }
}

const getRepositoriesForCurrentUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const repositories = await Repository.find({ owner: userId });

        if (!repositories || repositories.length == 0) {
            res.status(404).json({ error: "User Repositories not found!" });
        }

        res.json({ message: "Repositories found!", repositories });
    } catch (err) {
        console.error("Error during fetching user repositories:", err.message);
        res.status(500).send("Server error");
    }
}

const updateRepositoryById = async (req, res) => {
    const { repoId } = req.params;
    const { content, description } = req.body;

    try {
        const updateFields = {};

        if (content) {
            updateFields.content = content;
        }
        if (description) {
            updateFields.description = description;
        }

        const updatedRepository = await Repository.findByIdAndUpdate(
            repoId,
            updateFields,
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ error: "Repository not found" });
        }

        res.json({ message: "Repository updated successfully!", updatedRepository });

    } catch (err) {
        console.error("Error during updating repository:", err.message);
        res.status(500).send("Server error");
    }
}

const toggleVisibilityById = async (req, res) => {
    const { repoId } = req.params;

    try {
        const repository = await Repository.findById(repoId);

        if (!repository) {
            return res.status(400).json({ error: "Repository not found!" });
        }

        repository.visibility = !repository.visibility;
        const updatedRepository = await repository.save();

        res.json({ message: "Repository visibility toggled successfully!", updatedRepository });
    } catch (err) {
        console.error("Error during toggling repository:", err.message);
        res.status(500).send("Server error");
    }
}

const deleteRepositoryById = async (req, res) => {
    const { repoId } = req.params;

    try {
        const repository = await Repository.findByIdAndDelete(repoId);

        if(!repository) {
            return res.status(404).json({ error: "Repository not found!" });
        } 

        res.json({ message: "Repository deleted successfully" });
    } catch (err) {
        console.error("Error during deleting repository:", err.message);
        res.status(500).send("Server error");
    }
}

module.exports = {
    getAllRepositories,
    createRepository,
    getRepositoryById,
    getRepositoryByName,
    getRepositoriesForCurrentUser,
    updateRepositoryById,
    deleteRepositoryById,
    toggleVisibilityById,
};