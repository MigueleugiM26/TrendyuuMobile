import axiosIntance from "@/lib/axiosConfig";

export interface TextoAudioSchema {
  texto: string;
  voz: number;
  output_file: string;
  requiredCredits: number;
}

interface ErrorResponse {
  response?: {
    data?: {
      error?: string;
    };
  };
}

export const converterTextoEmAudio = async (data: TextoAudioSchema) => {
  try {
    const token = localStorage.getItem("accessToken");

    const response = await axiosIntance.post(
      "/api/audio/converter-texto-em-audio",
      data,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error: unknown) {
    const err = error as ErrorResponse;
    throw new Error(
      err.response?.data?.error || "Erro ao converter texto em áudio"
    );
  }
};
