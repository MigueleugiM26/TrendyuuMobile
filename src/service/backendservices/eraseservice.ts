import axiosInstance from "@/lib/axiosConfig";

interface UploadResponse {
  message: string;
  image_url: string;
  filename: string;
}

interface UploadError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

export const uploadImage = async (file: File): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post(
      "/api/imagens/upload-image",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data; // Retorna o JSON com { message, image_url, filename }
  } catch (error: unknown) {
    const err = error as UploadError;
    throw new Error(err.response?.data?.error || "Erro ao processar a imagem.");
  }
};
