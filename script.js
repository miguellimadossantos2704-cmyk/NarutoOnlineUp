document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('botForm');
    const msgEl = document.getElementById('form-message');
    const botList = document.getElementById('botList');
    const countEl = document.getElementById('count');

    // Polling status
    function fetchStatus() {
        fetch('/api/status')
            .then(res => res.json())
            .then(data => {
                countEl.textContent = data.total;
                renderBots(data.bots);
            })
            .catch(err => console.error("Erro ao buscar status:", err));
    }

    function renderBots(bots) {
        if (bots.length === 0) {
            botList.innerHTML = '<div class="empty-state">Nenhum Jutsu Ativo no Servidor.</div>';
            return;
        }

        botList.innerHTML = bots.map(bot => `
            <div class="bot-card ${bot.erro ? 'error' : ''}">
                <div class="bot-header">
                    <span class="bot-user">@${bot.usuario}</span>
                    <span class="bot-status">${bot.status.toUpperCase()}</span>
                </div>
                <div style="font-size: 0.8rem; color: #88aacc;">
                    Iniciado: ${new Date(bot.startTime).toLocaleTimeString()}
                </div>
                ${bot.erro ? `<div style="color: #ff3366; font-size: 0.8rem; margin-top: 4px;">=> ${bot.erro}</div>` : ''}
            </div>
        `).join('');
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const usuario = document.getElementById('usuario').value;
        const senha = document.getElementById('senha').value;

        msgEl.className = '';
        msgEl.textContent = 'Iniciando link neural...';

        try {
            const btn = form.querySelector('button');
            btn.disabled = true;

            const res = await fetch('/api/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario, senha })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Erro desconhecido');

            msgEl.className = 'success';
            msgEl.textContent = data.message;
            form.reset();
            fetchStatus(); // Atualiza lista na hora
        } catch (err) {
            msgEl.className = 'error';
            msgEl.textContent = '[X] ERRO: ' + err.message;
        } finally {
            form.querySelector('button').disabled = false;
        }
    });

    // Iniciar polling
    fetchStatus();
    setInterval(fetchStatus, 3000); // Atualiza a cada 3 segundos
});
