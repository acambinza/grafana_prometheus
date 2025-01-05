const express = require('express')
const promClient = require('prom-client')
const register = promClient.register

const appMetrics = express()

// criandos os tipos de metricas

const contadorRequisicoes = new promClient.Counter({
    name: 'app_metrics_total_request',
    help: 'total de requisicoes',
    labelNames: ['statusCode']
})

const usuariosLogados = new promClient.Gauge({
    name: 'app_metrics_total_usuarios_logados',
    help: 'total de usuario logados na app'
})

const tempoDeResposta = new promClient.Histogram({
    name: 'app_metrics_duracao_request',
    help: 'tempo de resposta da App'
})

// simulando requisicoes na app

let zerarUsuariosLogados = false;

function randn_bm(min, max, skew) {
	var u = 0, v = 0;
	while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
	while (v === 0) v = Math.random();
	let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

	num = num / 10.0 + 0.5; // Translate to 0 -> 1
	if (num > 1 || num < 0) num = randn_bm(min, max, skew); // resample between 0 and 1 if out of range
	num = Math.pow(num, skew); // Skew
	num *= max - min; // Stretch to fill range
	num += min; // offset to min
	return num;
}


setInterval(() => {
	// Incrementa contador de requisições
	var taxaDeErro = 5;
	var statusCode = (Math.random() < taxaDeErro/100) ? '500' : '200';
	contadorRequisicoes.labels(statusCode).inc();

	// Atualiza gauge de usuários logados
	var usuariosOnline = zerarUsuariosLogados ? 0 : 500 + Math.round((50 * Math.random()))
	usuariosLogados.set(usuariosOnline);

	// Observa tempo de resposta
	var tempoObservado = randn_bm(0, 3, 4);
	tempoDeResposta.observe(tempoObservado);
}, 500);


// iniciado a app
appMetrics.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
	res.end(await register.metrics());
})


appMetrics.listen(3001)