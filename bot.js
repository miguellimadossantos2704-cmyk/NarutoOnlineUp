const puppeteer = require('puppeteer');

async function iniciarBot(usuario, senha) {
    console.log(`[BOT - ${usuario}] Invocando navegador...`);

    // Na VPS, deve ser headless: true para não consumir recursos massivos renderizando tela
    // Usamos argumentos extras úteis em servidores linux para não dar erro
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true, // Ou "new" em versões mais novas
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    } catch (err) {
        console.error(`[BOT - ${usuario}] Falha Crítica ao abrir navegador:`, err);
        return { success: false, error: "Erro de invocação do navegador" };
    }

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    try {
        console.log(`[BOT - ${usuario}] Navegando até o Naruto Online...`);
        await page.goto('https://narutoonline.com.br/', { waitUntil: 'networkidle2' });

        // --- INFILTRAÇÃO ---
        console.log(`[BOT - ${usuario}] Tentando inserir credenciais...`);
        // await page.type('#usuario', usuario);
        // await page.type('#senha', senha);
        // await page.click('#btn-logar');

        console.log(`[BOT - ${usuario}] Login simulado feito! Esperando carregamento pesado...`);
        await new Promise(r => setTimeout(r, 10000));

        let loopsRestantes = 5; // Bot vai rodar apenas 5 vezes e morrer, para não explodir sua VPS nos testes

        return new Promise((resolve) => {
            const botInterval = setInterval(async () => {
                if (loopsRestantes <= 0) {
                    clearInterval(botInterval);
                    console.log(`[BOT - ${usuario}] Treinamento concluído. Sumindo na fumaça... 💨`);
                    await browser.close();
                    resolve({ success: true, message: `Terminado` });
                    return;
                }

                console.log(`[BOT - ${usuario}] A caça de missões (Loops restantes: ${loopsRestantes})`);

                // Simulação da lógica original de caça
                try {
                    const botoes = await page.$$('div, button, a');
                    for (let botao of botoes) {
                        let texto = await page.evaluate(el => el.innerText, botao);
                        if (texto && (texto.includes("Concluir") || texto.includes("Receber"))) {
                            await botao.click();
                            console.log(`[BOT - ${usuario}] Missão coletada! 📈 XP Ganhado!`);
                        }
                    }
                } catch (e) {
                    console.error(`[BOT - ${usuario}] Erro ao procurar missão:`, e.message);
                }

                loopsRestantes--;
            }, 5000); // 5 segundos para teste rápido
        });

    } catch (err) {
        console.error(`[BOT - ${usuario}] Deu ruim no jutsu: `, err);
        await browser.close();
        return { success: false, error: err.message };
    }
}

module.exports = { iniciarBot };
