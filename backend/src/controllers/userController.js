const userService = require('../services/userService.js')

async function createNewUser(req, res) {
    try {
        const newUser = await userService.createUser(req.body);
        if(newUser.code !== 200) {
            return res.status(newUser.code).json({ message: newUser.message });
        }
        return res.status(200).json({ message: newUser.message, userId: newUser.userId });
    } catch (error) {
        console.error("Fehler beim Erstellen eines neuen Nutzers:", error);
        return res
            .status(500)
            .json({ message: "Fehler beim Erstellen eines neuen Nutzers." });
    }
}

module.exports = {
    createNewUser,
    // deleteUser,
    // getInfo
};