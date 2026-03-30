const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Saves to: backend/uploads/products
const uploadDir = path.resolve(__dirname, '..', '..', 'uploads', 'products');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        try {
            fs.mkdirSync(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (err) {
            cb(err);
        }
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname || '').toLowerCase();

        const rawArtNr = req.body?.artnr;
        const artnrDigits = String(rawArtNr ?? '').replace(/\D/g, '');
        const artnrPart = artnrDigits ? `a${artnrDigits}` : 'aunknown';

        const typeMap = {
            heroImage: 'hero',
            secondImage: 'second',
            thirdImage: 'third',
        };
        const imgType = typeMap[file.fieldname] || 'image';

        const baseName = `${artnrPart}-${imgType}`;
        let candidate = `${baseName}${ext}`;

        // Avoid silently overwriting an existing file
        try {
            let i = 2;
            while (fs.existsSync(path.join(uploadDir, candidate))) {
                candidate = `${baseName}-${i}${ext}`;
                i += 1;
            }
        } catch {
            // ignore
        }

        cb(null, candidate);
    },
});

const fileFilter = (req, file, cb) => {
    const allowed = new Set(['image/jpeg', 'image/png', 'image/webp']);
    if (!allowed.has(file.mimetype)) {
        return cb(new Error('Nur JPEG, PNG oder WEBP erlaubt'), false);
    }
    cb(null, true);
};

module.exports = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB pro Datei
        files: 3,
    },
});
