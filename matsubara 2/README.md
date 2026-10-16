# Matsubara

Placar de Matsubara em português, pensado para o celular. Next.js App Router, React, TypeScript e CSS responsivo, sem backend e sem cadastro. Pronto para Vercel e exportação estática.

## Executar

Requer Node.js 20.9+ e npm.

```sh
npm install
npm run dev
```

Abra http://localhost:3000. Validação e build:

```sh
npm test
npm run typecheck
npm run build
```

O build gera `out/`. Para servir o build localmente: `python3 -m http.server 3000 --directory out`. `next start` não se aplica à exportação estática.

## Arquitetura

- `app/layout.tsx`: idioma, metadados, manifesto e estilos.
- `app/page.tsx`: entrada do aplicativo.
- `components/Matsubara.tsx`: navegação, estado React, telas e componentes visuais; um shell compartilhado preserva os dados entre telas.
- `lib/game.ts`: tipos, regras puras, cálculo de coringas, pontuação, classificação, validação e importação.
- `tests/game.test.ts`: testes com Node Test Runner e tsx.
- `public/`: service worker, manifesto e ícones locais.

Rotas: `/`, `/novo/`, `/partida/`, `/regras/`, `/campeonatos/`, `/configuracoes/` e `/resultado/`. A navegação entre telas preserva o estado React e o histórico do navegador. Offline, uma rota ainda não visitada retorna o shell inicial, permitindo retomar pelo botão Continuar. O estado da aplicação usa hooks React; o motor de regras é independente da interface. CSS com variáveis substitui Tailwind/shadcn para manter poucas dependências. A estrutura permite extrair telas em componentes menores conforme a aplicação crescer.

## Regras e decisões

- São necessários pelo menos dois jogadores, sem máximo definido; nomes distintos, IDs UUID estáveis e ordem configurável antes do início.
- Cada partida tem exatamente sete rodadas. O vencedor recebe −20. Pontuações dos demais devem ser inteiras e não negativas.
- Nenhum ranking acumulado é renderizado durante uma partida ativa. Ao completar a sétima rodada, aparece o ranking da partida. O geral só aparece ao encerrar o campeonato entre partidas.
- Empates compartilham colocação e vitória (ranking de competição: 1, 1, 3); nenhum desempate arbitrário.
- Pedidos pertencem à partida, nunca ao campeonato, e não se alteram ao editar resultados históricos. Na edição, os botões de pedido ficam bloqueados. Uma nova partida começa com zero.
- O histórico guarda o retrato dos pedidos na hora de salvar cada rodada. Correções de pedidos são feitas na rodada atual; desfazer não permite números negativos.
- O coringa especial é opcional, informativo e aparece da quarta à sétima rodada. A calculadora usa o valor original das cartas, inclusive quando se tornam coringas especiais. K volta para A.
- A calculadora registra valores, sem simular a mesa nem limitar baralhos/cartas. Toque em uma carta selecionada para removê-la.
- A pontuação rápida começa em zero; confirme os pontos de cada jogador antes de salvar. Alternar os modos preserva os pontos atuais; adicionar/remover uma carta recalcula pela seleção de cartas.
- Pode haver vários campeonatos ativos no histórico. Iniciar um novo não apaga os anteriores. Só é possível encerrar um campeonato após terminar a partida atual.
- Os dados mockados são opcionais: na tela de campeonatos vazia, escolha “Explorar com dados de demonstração”. Não são misturados automaticamente às partidas reais.

## Persistência e backup

Autosave em localStorage, chave `matsubara-v1`, incluindo rascunho da rodada e configurações. O volume de dados é pequeno; localStorage oferece persistência suficiente sem a complexidade de IndexedDB. Todas as operações acontecem no aparelho. Limpar o navegador remove dados; use Exportar backup em Configurações. Importar valida o formato e solicita confirmação antes de substituir os dados atuais. Armazenamento indisponível gera um aviso com opção de exportar.

Os dados não sincronizam entre dispositivos e não têm criptografia local. A ocultação do placar é uma regra de interface, não uma barreira contra inspeção técnica do armazenamento. Evite navegação privada para guardar campeonatos.

## Publicar na Vercel

1. Envie esta pasta para um repositório Git.
2. Na Vercel, escolha **Add New → Project** e importe o repositório.
3. Selecione Next.js, comando `npm run build` e saída `out` (exportação estática).
4. Publique. Não são necessárias variáveis de ambiente nem banco de dados.

Também pode hospedar `out/` em qualquer hospedagem estática HTTPS. Os arquivos `.openai/` são metadados de publicação Sites e não são necessários na Vercel.

## Instalar no celular e offline

A instalação precisa de HTTPS (ou localhost para desenvolvimento). No Android/Chrome: menu → Instalar aplicativo. Quando disponível, o botão de instalação aparece em Configurações. No iPhone/Safari: Compartilhar → Adicionar à Tela de Início. No computador: ícone de instalação na barra de endereços/menu do navegador.

Abra o app online uma vez e aguarde o carregamento completo. O service worker guarda a página inicial e os recursos carregados em cache; campeonatos e rascunhos ficam no armazenamento local. Feche e reabra offline para continuar. Limpar os dados do site também elimina cache e partidas. Ao publicar nova versão dos assets, incremente o nome do cache em `public/sw.js`. O tema segue o sistema por padrão, com opção clara/escura salva.

## Acessibilidade e verificações

Idioma pt-BR, botões com nomes acessíveis, foco por teclado, labels em formulários, avisos com role=status, preferências de movimento reduzido, contraste e tamanhos responsivos. O diálogo de confirmação usa foco inicial; navegação de telas fica no próprio app. Antes de uso em larga escala, faça testes com leitores de tela, instalação em dispositivos físicos e os navegadores-alvo.
