const userService = require("../services/userService.js");

async function createNewUser(req, res) {
    try {
        const newUser = await userService.createUser(req.body);
        if (newUser.code !== 200) {
            return res.status(newUser.code).json({ message: newUser.message });
        }
        return res
            .status(200)
            .json({ message: newUser.message, userId: newUser.userId });
    } catch (error) {
        console.error("Fehler beim Erstellen eines neuen Nutzers:", error);
        return res
            .status(500)
            .json({ message: "Fehler beim Erstellen eines neuen Nutzers." });
    }
}

async function updateUserInfo(req, res) {
    try {
        const data = req.body;
        data.userId = req.params.id;
        const result = await userService.updateUser(data);
        res.status(200).json({ message: result.message });
    } catch (error) {
        res.status(500).json({
            message: "Fehler beim Aktualisieren der Nutzerdaten",
        });
    }
}

async function getUserData(req, res) {
    try {
        const userId = req.params.id;
        const userData = await userService.getUserData(userId);
        res.status(userData.code).json(userData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function deleteUser(req, res) {
    try {
        const userId = req.params.id;
        const result = await userService.deleteAccount(userId);
        res.status(result.code).json({ message: result.message });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function loginUser(req, res) {
    try {
        const userData = req.body
        const findUser = await userService.login(userData)
        res.status(findUser.code).json({ userId: findUser.userId })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

module.exports = {
    createNewUser,
    updateUserInfo,
    getUserData,
    deleteUser,
    loginUser
};
