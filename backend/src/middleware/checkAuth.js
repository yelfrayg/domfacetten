require("dotenv").config();

const jwt = require("jsonwebtoken");

function generateToken(userId, email) {
    return jwt.sign({ userId, email }, process.env.JWT_SECRET, { expiresIn: "1h" });
}

function verifyToken(req, res, next) {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ error: "Bitte anmelden, um auf diese Seite zuzugreifen." });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.exp * 1000 < Date.now()) {
            return res.status(401).json({ expired: true, message: 'Sitzung abgelaufen.' })
        }
        req.userId = decoded.userId;
        next();
    } catch (error) {
        // Allgemeiner Fehler
        res.status(401).json({ error: "Invalid token", message: 'Erst anmelden.' });
    }
}

module.exports = { generateToken, verifyToken };