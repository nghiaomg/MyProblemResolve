import express from 'express';
import Busboy from 'busboy';
import fs from 'fs';
import path from 'path';

const app = express();

app.post('/upload', (req, res) => {
    const busboy = Busboy({
        headers: req.headers,
        limits: {
            fileSize: 10 * 1024 * 1024 * 1024, // 1GB
            files: 1
        }
    });

    let uploadPath = '';
    let hadError = false;

    // Xử lý file stream
    busboy.on('file', (fieldname, file, info) => {
        const { filename, mimeType } = info;
        const uploadDir = './uploads';

        // Tạo folder nếu chưa có
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        uploadPath = path.join(uploadDir, Date.now() + '_' + filename);

        // Tạo write stream -> PIPE trực tiếp (KHÔNG buffer RAM)
        const writeStream = fs.createWriteStream(uploadPath, {
            highWaterMark: 64 * 1024  // 64KB/chunk
        });

        // Peak RAM constant: ~128KB(2 × 64KB buffers)
        // 64KB: file stream(readable buffer từ client)
        // 64KB: writeStream(writable buffer chờ ghi disk)
        file.pipe(writeStream);

        // Handle errors
        file.on('limit', () => {
            hadError = true;
            writeStream.destroy();
            fs.unlink(uploadPath, () => { });
            return res.status(413).json({ error: 'File quá lớn (>1GB)' });
        });

        writeStream.on('error', (err) => {
            hadError = true;
            console.error('Write error:', err);
            res.status(500).json({ error: 'Lưu file lỗi' });
        });

        writeStream.on('finish', () => {
            console.log(`Upload thành công: ${uploadPath}`);
        });
    });

    // Hoàn thành upload
    busboy.on('finish', () => {
        if (!hadError && uploadPath) {
            res.json({
                message: 'Upload OK',
                path: uploadPath,
                url: `/files/${path.basename(uploadPath)}`
            });
        }
    });

    busboy.on('error', (err) => {
        console.error('Busboy error:', err);
        res.status(500).json({ error: 'Parse upload lỗi' });
    });

    // Pipe request -> busboy
    req.pipe(busboy);
});

app.listen(3000, () => {
    console.log('Server chạy port 3000');
});