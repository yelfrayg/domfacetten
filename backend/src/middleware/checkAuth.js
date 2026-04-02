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

const getPaypalAccessToken = async () => {
    const auth = Buffer.from(
        process.env.PAYPAL_CLIENT_ID + ':' + process.env.PAYPAL_CLIENT_SECRET
    ).toString('base64')

    const req = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
        method: 'POST',
        headers: {
            Authorization: `Basic ${auth}`
        },
        body: 'grant_type=client_credentials'
    })

    const res = await req.json()
    return res.access_token
}

module.exports = {
    checkDate,
    getPaypalAccessToken
};