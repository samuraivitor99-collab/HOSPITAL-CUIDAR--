# Cuidar + — site do hospital

Site de demonstracao de um hospital ficticio, escrito em TypeScript e entregue como um unico arquivo HTML, sem depender de internet.

## Abrir agora

Clique duas vezes em `index.html`. Ele ja esta pronto e funciona offline (as fontes vem da internet; sem conexao, o navegador usa fontes parecidas).

## Estrutura

    index.html          o site pronto (nao edite: ele e gerado)
    src/app.ts          toda a logica em TypeScript
    src/template.html   a estrutura da pagina e todo o CSS
    build.js            compila o TypeScript e gera o index.html
    package.json        comandos do projeto
    tsconfig.json       configuracao do TypeScript (modo strict)

## Editar e gerar de novo

Precisa do Node.js 18 ou mais novo (https://nodejs.org).

    npm install
    npm run build      gera o index.html
    npm run check      so verifica os tipos, sem gerar nada

Edite `src/app.ts` (comportamento) ou `src/template.html` (visual e conteudo) e rode `npm run build` outra vez.

## O que da para trocar rapidamente

Em `src/app.ts`, no inicio do arquivo, estao as listas usadas na pagina: `specialties`, `units`, `stats`, `steps`, `faq`, `doctors` e `plans`. Em `src/template.html`, as cores ficam nas variaveis `:root` (e no bloco de tema escuro logo abaixo), e os telefones e o endereco estao no rodape e no botao de emergencia.

## Avisos

- Hospital ficticio. Nomes de medicos, convenios, numeros, tempos de espera e telefones sao inventados.
- A tela de login e uma simulacao: nao existe conta nem servidor. Qualquer e-mail valido com senha de 6 ou mais caracteres entra, e o nome fica guardado apenas na aba aberta.
- O agendamento tambem e simulado: nada e enviado a lugar nenhum.
- Nao use em producao sem trocar isso por um sistema de verdade, com servidor, autenticacao e tratamento adequado dos dados dos pacientes.
