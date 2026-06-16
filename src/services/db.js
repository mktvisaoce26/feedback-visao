// Configuração da API do Google Sheets
// Esta URL conecta o formulário e o painel de administração à sua planilha do Google Sheets
const GOOGLE_SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbx0qfctBe82gIwEt0bP4nv4Ji8JXvqAv3K3kdgsUuThh-F-aNawQr-qyltWtdw0zkL2/exec';

export const Io = {
  entities: {
    Resposta: {
      create: async (payload) => {
        const id = Math.random().toString(36).substring(2, 9);
        const bodyData = {
          id: id,
          motivo: payload.motivo,
          motivo_id: payload.motivo_id
        };

        try {
          const response = await fetch(GOOGLE_SHEETS_API_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
              'Content-Type': 'text/plain;charset=utf-8', // Evita o pré-vôo CORS do navegador
            },
            body: JSON.stringify(bodyData)
          });
          
          if (!response.ok) throw new Error('Erro na rede do Google Sheets');
          return { id, ...payload };
        } catch (error) {
          console.error("Falha ao salvar no Google Sheets, salvando no localStorage como fallback:", error);
          // Fallback para localStorage caso dê algum erro temporário ou offline
          const fallbackData = JSON.parse(localStorage.getItem('feedback_fallback') || '[]');
          const newRecord = { id, ...payload, created_date: new Date().toISOString() };
          fallbackData.push(newRecord);
          localStorage.setItem('feedback_fallback', JSON.stringify(fallbackData));
          return newRecord;
        }
      },
      list: async (sortParam = '-created_date', limit = 1000) => {
        try {
          const response = await fetch(GOOGLE_SHEETS_API_URL);
          if (!response.ok) throw new Error('Erro ao listar do Google Sheets');
          
          let data = await response.json();
          
          // Ordenação dos registros
          if (sortParam.startsWith('-')) {
            const field = sortParam.substring(1);
            data.sort((a, b) => new Date(b[field]) - new Date(a[field]));
          } else {
            data.sort((a, b) => new Date(a[sortParam]) - new Date(b[sortParam]));
          }
          
          return data.slice(0, limit);
        } catch (error) {
          console.error("Falha ao ler do Google Sheets:", error);
          return [];
        }
      }
    }
  }
};
