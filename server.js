const http = require("http");
const fs = require("fs");
const path = require("path");
const dns = require("dns").promises;
const nodemailer = require("nodemailer");

require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USUARIO,
        pass: process.env.EMAIL_SENHA
    }
});


const PORT = process.env.PORT || 3000;

const limiteTentativas = 5;
const janelaTempo = 60 * 1000;

const tentativasPorIP = new Map();

const mimeTypes = {

    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".svg": "image/svg+xml"
};

const server = http.createServer((req, res) => {

    res.setHeader("X-Content-Type-Options", "nosniff");
res.setHeader("X-Frame-Options", "SAMEORIGIN");

    if (req.method === "POST" && req.url === "/api/contato") {

       const ip = req.socket.remoteAddress;

const agora = Date.now();
const registro = tentativasPorIP.get(ip);

if (!registro || agora - registro.inicio >= janelaTempo) {
    tentativasPorIP.set(ip, {
        inicio: agora,
        tentativas: 1
    });
} else {
    registro.tentativas++;

    if (registro.tentativas > limiteTentativas) {
        res.writeHead(429, {
            "Content-Type": "application/json; charset=utf-8"
        });

        res.end(JSON.stringify({
            sucesso: false,
            mensagem: "Muitas tentativas. Aguarde um minuto."
        }));

        return;
    }
}

        let body = "";
        const limite = 2 * 1024;

        req.on("data", chunk => {
            body += chunk.toString();

            console.log(
                "Tamanho recebido:",
                Buffer.byteLength(body, "utf8"),
                "bytes"
            );

            if (Buffer.byteLength(body, "utf8") > limite) {
                res.writeHead(413, {
                    "Content-Type": "application/json; charset=utf-8"
                });

                res.end(JSON.stringify({
                    sucesso: false,
                    mensagem: "A mensagem enviada é muito grande."
                }));

                req.destroy();
            }
        });

        req.on("end", async () => {
            try {
                const dados = JSON.parse(body);

                console.log("Nome:", dados.nome);
                console.log("E-mail:", dados.email);
                console.log("Mensagem:", dados.mensagem);

                if (
                    typeof dados.nome !== "string" ||
                    typeof dados.email !== "string" ||
                    typeof dados.mensagem !== "string"
                ) {
                    res.writeHead(400, {
                        "Content-Type": "application/json; charset=utf-8"
                    });

                    res.end(JSON.stringify({
                        sucesso: false,
                        mensagem: "Os campos devem ser textos."
                    }));

                    return;
                }

                if (!dados.nome || !dados.email || !dados.mensagem) {
                    res.writeHead(400, {
                        "Content-Type": "application/json; charset=utf-8"
                    });

                    res.end(JSON.stringify({
                        sucesso: false,
                        mensagem: "Todos os campos são obrigatórios."
                    }));

                    return;
                }

                if (
                    dados.nome.length > 100 ||
                    dados.email.length > 150 ||
                    dados.mensagem.length > 1000
                ) {
                    res.writeHead(400, {
                        "Content-Type": "application/json; charset=utf-8"
                    });

                    res.end(JSON.stringify({
                        sucesso: false,
                        mensagem: "Um ou mais campos ultrapassaram o tamanho permitido."
                    }));

                    return;
                }

                const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email);

                if (!emailValido) {
                    res.writeHead(400, {
                        "Content-Type": "application/json; charset=utf-8"
                    });

                    res.end(JSON.stringify({
                        sucesso: false,
                        mensagem: "Digite um e-mail válido."
                    }));

                    return;
                }

                const dominio = dados.email.split("@")[1];

                console.log("VOU CONSULTAR O DNS:", dominio);

                try {
                    await dns.resolveMx(dominio);
                    console.log("Domínio encontrado:", dominio);
                } catch (erro) {
                    console.log("Erro DNS:", erro.code);

                    if (erro.code === "ENOTFOUND") {
                        res.writeHead(400, {
                            "Content-Type": "application/json; charset=utf-8"
                        });

                        res.end(JSON.stringify({
                            sucesso: false,
                            mensagem: "O domínio do e-mail não existe."
                        }));

                        return;
                    }

                    res.writeHead(500, {
                        "Content-Type": "application/json; charset=utf-8"
                    });

                    res.end(JSON.stringify({
                        sucesso: false,
                        mensagem: "Não foi possível verificar o domínio do e-mail."
                    }));

                    return;
                }

                const email = {
                    from: process.env.EMAIL_USUARIO,
                    to: process.env.EMAIL_USUARIO,
                    replyTo: dados.email,
                    subject: `Novo contato pelo site — ${dados.nome}`,
                    text: `
Nome: ${dados.nome}
E-mail: ${dados.email}

Mensagem:
${dados.mensagem}
`
                };

                try {
                    await transporter.sendMail(email);
                    console.log("E-mail enviado com sucesso.");
                } catch (erro) {
                    console.log("Erro ao enviar e-mail:");
                    console.log(erro.message);

                    res.writeHead(500, {
                        "Content-Type": "application/json; charset=utf-8"
                    });

                    res.end(JSON.stringify({
                        sucesso: false,
                        mensagem: "Não foi possível enviar a mensagem."
                    }));

                    return;
                }

                res.writeHead(200, {
                    "Content-Type": "application/json; charset=utf-8"
                });

                res.end(JSON.stringify({
                    sucesso: true,
                    mensagem: "Mensagem recebida pela Dom Pedro Tech."
                }));
            } catch (erro) {
                res.writeHead(400, {
                    "Content-Type": "application/json; charset=utf-8"
                });

                res.end(JSON.stringify({
                    sucesso: false,
                    mensagem: "Os dados enviados são inválidos."
                }));
            }
        });

        return;
    }

   const urlPath = decodeURIComponent(req.url.split("?")[0]);

const arquivosPublicos = {
    "/": "index.html",
    "/index.html": "index.html",
    "/css/style.css": "css/style.css",
    "/js/script.js": "js/script.js",
    "/imagem/dom-pedro-tech.jpg": "imagem/dom-pedro-tech.jpg"
};

const arquivo = arquivosPublicos[urlPath];

if (!arquivo) {
    res.writeHead(404, {
        "Content-Type": "text/plain; charset=utf-8"
    });

    res.end("Arquivo não encontrado.");
    return;
}

const filePath = path.join(__dirname, arquivo);

    console.log("URL solicitada:", req.url);
    console.log("Arquivo procurado:", filePath);

    const extension = path.extname(filePath);
    const contentType = mimeTypes[extension] || "application/octet-stream";

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === "ENOENT") {
                res.writeHead(404, {
                    "Content-Type": "text/plain; charset=utf-8"
                });

                res.end("Arquivo não encontrado.");
                return;
            }

            res.writeHead(500, {
                "Content-Type": "text/plain; charset=utf-8"
            });

            res.end("Erro interno do servidor.");
            return;
        }

        res.writeHead(200, {
            "Content-Type": contentType
        });

        res.end(content);
    });
});

server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});