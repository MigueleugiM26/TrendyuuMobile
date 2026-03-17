import axiosInstance from "@/lib/axiosConfig";

/**
 * Função para baixar um vídeo do servidor
 * @param videoId - ID ou nome do arquivo de vídeo a ser baixado
 * @param fileName - Nome do arquivo para salvar no dispositivo do usuário
 */
export async function downloadVideo(
  videoId: string,
  fileName?: string
): Promise<void> {
  try {
    console.log(`Iniciando download do vídeo: ${videoId}`);

    // Fazer a requisição para o endpoint de download
    const response = await axiosInstance({
      url: `/api/video/download-video/${videoId}`,
      method: "GET",
      responseType: "blob", // Importante: define o tipo de resposta como blob
    });

    // Criar um URL de objeto a partir do blob recebido
    const url = window.URL.createObjectURL(new Blob([response.data]));

    // Criar um elemento <a> temporário para iniciar o download
    const link = document.createElement("a");
    link.href = url;

    // Definir o nome do arquivo para download
    link.setAttribute("download", fileName || videoId);

    // Adicionar o link ao documento, clicar nele e depois removê-lo
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Liberar o URL de objeto
    window.URL.revokeObjectURL(url);

    console.log("Download concluído com sucesso");
    return Promise.resolve();
  } catch (error) {
    console.error("Erro ao baixar o vídeo:", error);
    throw new Error(
      "Não foi possível baixar o vídeo. Por favor, tente novamente."
    );
  }
}

/**
 * Função para extrair o ID do vídeo a partir de uma URL completa
 * @param url - URL completa do vídeo
 * @returns ID ou nome do arquivo de vídeo
 */
export function extractVideoIdFromUrl(url: string): string {
  try {
    // Extrair o nome do arquivo da URL
    const urlParts = url.split("/");
    return urlParts[urlParts.length - 1];
  } catch (error) {
    console.error("Erro ao extrair ID do vídeo da URL:", error);
    throw new Error("URL de vídeo inválida");
  }
}
