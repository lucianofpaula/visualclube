"use server";

import { cloudinary } from "@/lib/cloudinary";

export type UploadResult = {
  success: boolean;
  url?: string;
  error?: string;
};

/**
 * Server Action para envio de fotos diretamente ao Cloudinary
 */
export async function uploadImageAction(formData: FormData): Promise<UploadResult> {
  try {
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "visualclube";

    if (!file || file.size === 0) {
      return { success: false, error: "Nenhum arquivo de imagem foi selecionado." };
    }

    // Validação de formato (apenas imagens válidas)
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
      "image/avif",
    ];

    if (!allowedMimeTypes.includes(file.type)) {
      return {
        success: false,
        error: "Formato inválido. Por favor, envie uma imagem nos formatos JPG, PNG ou WEBP.",
      };
    }

    // Limite de tamanho: 15MB
    const MAX_FILE_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: "A imagem é muito grande. O limite máximo permitido é de 15MB.",
      };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResponse = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [
            { quality: "auto" },
            { fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(buffer);
    });

    if (!uploadResponse?.secure_url) {
      return { success: false, error: "Falha ao obter URL segura do Cloudinary." };
    }

    return {
      success: true,
      url: uploadResponse.secure_url,
    };
  } catch (err: any) {
    console.error("Erro no upload para o Cloudinary:", err);
    return {
      success: false,
      error: err?.message || "Ocorreu um erro ao processar o upload da imagem.",
    };
  }
}
