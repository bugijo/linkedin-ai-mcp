# OAuth LinkedIn — preparação

O módulo `src/oauth.ts` cria uma URL oficial de autorização com um `state` aleatório de 256 bits e valida o retorno.

**Ainda não há login funcional:** falta implementar callback local, troca do código por token, verificação de expiração, armazenamento seguro e revogação/desconexão.

## Configuração futura
1. Criar aplicativo em https://www.linkedin.com/developers/apps e vinculá-lo a uma LinkedIn Page.
2. Habilitar apenas produtos e escopos necessários.
3. Registrar exatamente a URL de retorno no portal.
4. Guardar client ID e client secret fora do Git.
5. Iniciar autorização localmente, conferir state, trocar código por token e guardar token com permissões restritas.

Não enviar tokens, códigos OAuth, cookies ou segredos pelo chat ou por issues públicas.

## Segurança
- Nenhuma ação externa é executada pela ferramenta de rascunho.
- Publicação exigirá confirmação explícita e limites.
- Não usar scraping, automação de sessão ou APIs privadas do LinkedIn.
