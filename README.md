# LinkedIn AI MCP

Servidor MCP experimental em TypeScript para preparar conteúdo e integrar publicação pela **API oficial** do LinkedIn.

**Estado:** código em desenvolvimento; compilação e autenticação real ainda não verificadas. Nenhuma conta está conectada. O repositório é público: nunca envie segredos.

## Recursos implementados

- `get_capabilities`: inventário de ferramentas.
- `draft_post`: rascunho local, sem efeitos externos.
- `auth_status`: indica presença de token local válido, sem revelá-lo.
- `preview_publish`: prévia com código temporário de confirmação.
- `confirm_publish`: tentativa de publicação, **desabilitada por padrão**.
- `npm run auth`: fluxo OAuth local com callback e gravação restrita do token.

**Importante:** o código de confirmação retornado ao cliente MCP **não garante aprovação humana independente**; não habilite publicações autônomas. A integração remota com ChatGPT ainda não foi criada.

## Requisitos

- Node.js 22 ou superior
- npm
- Aplicativo LinkedIn Developer autorizado para `openid profile email w_member_social` (disponibilidade sujeita às regras da plataforma)

## Instalação (quando o CI estiver validado)

```bash
npm install
npm test
npm run build
```

Para iniciar localmente:

```bash
npm start
```

Exemplo de configuração de cliente MCP compatível com stdio:

```json
{
  "mcpServers": {
    "linkedin-ai": {
      "command": "node",
      "args": ["/CAMINHO/ABSOLUTO/linkedin-ai-mcp/dist/index.js"]
    }
  }
}
```

## OAuth local

1. Crie um aplicativo no [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps).
2. Configure o redirect URI **exatamente** como `http://localhost:8787/callback`.
3. Defina `LINKEDIN_CLIENT_ID` e `LINKEDIN_CLIENT_SECRET` como variáveis de ambiente **somente na sua máquina**.
4. Execute `npm run auth` após compilar; abra o link impresso no terminal.
5. O token será armazenado em `~/.config/linkedin-ai-mcp/token.json` com modo de arquivo 0600.

Não compartilhe client secret, tokens, códigos de autorização ou cookies neste chat.

## Segurança e limitações

- Publicação só é tentada se `LINKEDIN_ENABLE_PUBLISH=true`; **não habilitar antes da validação ponta a ponta**.
- A publicação usa a API REST do LinkedIn, mas o endpoint, a versão e a identidade do autor precisam de teste com permissões reais.
- O mecanismo de prévia é um controle técnico inicial, não uma autorização humana robusta.
- O token é salvo localmente sem criptografia adicional; proteja o usuário e o dispositivo.
- Não há leitura de feed, mensagens, conexões, edição de perfil nem candidaturas automáticas.
- Não existe ainda servidor MCP HTTPS remoto para ChatGPT.
- Nenhum código de terceiros foi copiado; projetos de referência estão em [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Desenvolvimento

Branch: `dev/initial-foundation`. Não houve merge na `main`.
