const Repository = require('../models/repoModel');
const Issue = require('../models/issueModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { stat } = require('fs-extra');

dotenv.config();

const createIssue = async (req, res) => {
    const { title, description } = req.body;
    const { repoId } = req.params;

    try {
        const issue = new Issue({
            title,
            description,
            repository: repoId,
        });

        await issue.save();
        res.status(201).json(issue);
    } catch (err) {
        console.error("Error creating Issue:", err.message);
        res.status(500).send("Server error");
    }
};

const updateIssueById = async (req, res) => {
    const { issueId } = req.params;
    const { title, description, status } = req.body;
    try {
        const updateFields = {};

        if(title) updateFields.title = title;
        if(description) updateFields.description = description;
        if(status) updateFields.status = status;
        
        const issue = await Issue.findByIdAndUpdate(issueId, updateFields);
        if(!issue) {
            res.status(404).json({ error: "Issue not found!" });
        }

        res.status(201).json({ message: "Issue updated successfully!", issue });
    } catch (err) {
        console.error("Error updating Issue:", err.message);
        res.status(500).send("Server error");
    }
};

const deleteIssueById = async (req, res) => {
    const { issueId } = req.params;

    try {   
        const issue = await Issue.findByIdAndDelete(issueId);
        if(!issue) {
            res.status(404).json({ error: "Issue not found!" });
        }

        res.status(201).json({ message: "Issue deleted successfully!" });
    } catch (err) {
        console.error("Error deleting Issue:", err.message);
        res.status(500).send("Server error");
    }
};

const getAllIssues = async (req, res) => {
    const { repoId } = req.params;

    try {
        const issues = await Issue.find({ repository: repoId });

        if(!issues) {
            res.status(404).json({ error: "Issues not found!" });
        }

        res.status(200).json(issues);
    } catch (err) {
        console.error("Error during fetching issues:", err.message);
        res.status(500).send("Server error");
    }
};

const getIssueById = async (req, res) => {
    const { issueId } = req.params;

    try {
        const issue = await Issue.findById(issueId);
        if(!issue) {
            res.status(404).json({ error: "Issue not found!" });
        }

        res.status(201).json({ message: "Issue found successfully!" });
    } catch (err) {
        console.error("Error fetching issue:", err.message);
        res.status(500).send("Server error");
    }
};

module.exports = {
    createIssue,
    updateIssueById,
    deleteIssueById,
    getAllIssues,
    getIssueById
};