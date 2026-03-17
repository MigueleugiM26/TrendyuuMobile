import axiosIntance from '@/lib/axiosConfig';

interface ErrorResponse {
  response?: {
    data?: {
      error?: string;
    };
  };
}

export const downloadVideo = async (link: string) => {
  try {
    const response = await axiosIntance.get('/api/video/baixar/', {
      params: { link },
    });

    if (response.status === 200) {
      return response.data; // Sucesso
    }

    // Retorna um valor indicando que o download não foi bem-sucedido
    return { message: 'Erro inesperado ao processar o download.' };
  } catch (error: unknown) {
    // Verificação do tipo de erro
    const err = error as ErrorResponse;

    // Aqui você pode logar ou tratar o erro sem lançar exceção
    console.error('Erro no download:', err);

    // Retorna uma mensagem amigável ou qualquer valor que você queira
    return { message: 'Houve um problema ao tentar baixar o vídeo. Tente novamente.' };
  }
};
