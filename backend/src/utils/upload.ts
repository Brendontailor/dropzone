import multer from "multer";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, "..", "..", "..", "public", "uploads", "produtos");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.memoryStorage();

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Formato inválido. Use JPEG, PNG ou WebP."));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export async function processarImagemProduto(buffer: Buffer): Promise<string> {
  const nomeArquivo = `${uuidv4()}.webp`;
  const caminhoArquivo = path.join(UPLOAD_DIR, nomeArquivo);

  await sharp(buffer)
    .resize(800, 800, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(caminhoArquivo);

  return `/uploads/produtos/${nomeArquivo}`;
}

export async function deletarImagemProduto(url: string): Promise<void> {
  if (!url || !url.startsWith("/uploads/produtos/")) return;

  const nomeArquivo = path.basename(url);
  const caminhoArquivo = path.join(UPLOAD_DIR, nomeArquivo);

  if (fs.existsSync(caminhoArquivo)) {
    fs.unlinkSync(caminhoArquivo);
  }
}