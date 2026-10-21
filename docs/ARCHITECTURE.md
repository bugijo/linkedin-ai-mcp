# Arquitetura inicial

- Transporte local: MCP stdio, sem rede exposta.
- Autenticação LinkedIn: pendente, OAuth 2.0 oficial, escopos mínimos.
- Publicações: desativadas até implementar confirmação explícita, limites e deduplicação.
- Perfil e candidaturas: somente rascunhos locais; sem scraping ou alteração automatizada do LinkedIn.
- Compatibilidade ChatGPT remoto: fase posterior, requer HTTPS, autenticação do cliente e controle de acesso.
- Tokens: nunca armazenar em Git, logs ou respostas MCP.

## Fontes avaliadas
- https://github.com/vlpmedialtd/linkedin-mcp — OAuth e publicação oficial; MIT.
- https://github.com/2060-io/linkedin-mcp — limites e deduplicação; MIT.
- https://github.com/jcnh74/linkedin-profile-manager-mcp — análise e rascunhos; MIT.

Esta versão não incorpora código dos projetos acima. A avaliação é preliminar e não substitui auditoria de segurança de dependências.
