const express = require('express');
const path = require('path');
const { iniciarBot } = require('./bot');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Gerenciamento de instâncias em memória
const botsAtivos = new Map();

// Rota de API para receber o login e iniciar a automação
app.post('/api/start', async (req, res) => {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
        return res.status(400).json({ error: 'Usuário e senha são obrigatórios para o Jutsu.' });
    }

    if (botsAtivos.has(usuario)) {
        return res.status(400).json({ error: 'Ei, já tem um clone das sombras upando essa conta!' });
    }

    // Registra instância
    botsAtivos.set(usuario, { status: 'Iniciando', startTime: new Date().toISOString() });

    // Inicia o bot em background (Sem await pra não prender o request)
    iniciarBot(usuario, senha).then(result => {
        if (result.success) {
            botsAtivos.set(usuario, { status: 'Exausto/Finalizado', startTime: botsAtivos.get(usuario).startTime });
        } else {
            botsAtivos.set(usuario, { status: 'Falhou', erro: result.error });
        }

        // Limpa o bot depois de 5 minutos de finalizado/falhado
        setTimeout(() => {
            botsAtivos.delete(usuario);
        }, 5 * 60 * 1000);
    });

    res.json({ success: true, message: `Instância iniciada para ${usuario}. Preparando modo sábio...` });
});

app.get('/api/status', (req, res) => {
    const list = [];
    botsAtivos.forEach((val, key) => {
        list.push({ usuario: key, ...val });
    });
    res.json({ total: botsAtivos.size, bots: list });
});

app.listen(PORT, () => {
    console.log(`[MESTRE ROBÔ] API no ar na porta ${PORT}! Pode servir o café ☕`);
});
