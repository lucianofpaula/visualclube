import { v2 as cloudinary } from "cloudinary"

// Configuração do Cloudinary a partir das variáveis de ambiente
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dfwu67xmb",
  api_key: process.env.CLOUDINARY_API_KEY || "488667563426339",
  api_secret: process.env.CLOUDINARY_API_SECRET || "JDXmywgADY3Cu66tZjgX1T-WLO4",
  secure: true,
})

export { cloudinary }

/**
 * Faz upload de um buffer de imagem ou base64 para o Cloudinary
 */
export async function uploadImageToCloudinary(
  fileBuffer: Buffer | string,
  options: {
    folder?: string
    publicId?: string
    transformation?: any[]
  } = {}
): Promise<{ url: string; secureUrl: string; publicId: string }> {
  const { folder = "visualclube/avatars", publicId } = options

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: "image",
        transformation: [
          { width: 500, height: 500, crop: "fill", gravity: "face" },
          { quality: "auto:good", fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error || !result) {
          console.error("Erro no upload Cloudinary:", error)
          reject(error || new Error("Falha no upload para Cloudinary."))
          return
        }

        resolve({
          url: result.url,
          secureUrl: result.secure_url,
          publicId: result.public_id,
        })
      }
    )

    if (Buffer.isBuffer(fileBuffer)) {
      uploadStream.end(fileBuffer)
    } else if (typeof fileBuffer === "string") {
      // Se for data URI base64
      cloudinary.uploader
        .upload(fileBuffer, {
          folder,
          public_id: publicId,
          resource_type: "image",
          transformation: [
            { width: 500, height: 500, crop: "fill", gravity: "face" },
            { quality: "auto:good", fetch_format: "auto" },
          ],
        })
        .then((res) => {
          resolve({
            url: res.url,
            secureUrl: res.secure_url,
            publicId: res.public_id,
          })
        })
        .catch(reject)
    } else {
      reject(new Error("Formato de arquivo inválido para upload."))
    }
  })
}
