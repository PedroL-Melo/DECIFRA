require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Configuração da API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Mensagem vazia.' });
        }

        // Contexto do Professor de Matemática
        const systemContext = `(Contexto: Você é um assistente de matemática do projeto DECIFRA. Responda em português, seja didático, breve e incentive o aluno.)`;
        
        const fullPrompt = `${systemContext}\n\nAluno: ${message}`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });

    } catch (error) {
        console.error('Erro no servidor Gemini:', error);
        res.status(500).json({ error: 'Erro ao processar a IA. Verifique o console do servidor.' });
    }
});

app.listen(port, () => {
    console.log(`🚀 Servidor rodando na porta ${port} usando Gemini 2.5 Flash`);
});