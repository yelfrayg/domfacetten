require('dotenv').config();

const express = require('express')

async function checkDate(req, res, next) {
    const deleteKey = req.headers['delete-key'];
    if (deleteKey && deleteKey === process.env.DELETE_KEY) {
        next()
    } else {
        return res.status(401).json({ message: 'Unauthorized: Invalid delete key' });
    }
}

module.exports = checkDate;