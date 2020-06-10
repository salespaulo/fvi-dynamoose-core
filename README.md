# fvi-dynamoose-core

-   `npm run compile`: Executa a limpeza dos arquivos e diretorios.
-   `npm run debug-test`: Executa os testes unitários com o DEBUG ativo.
-   `npm run test`: Executa os testes unitários.
-   `npm run debug-dev`: Executa os testes unitários e espera por alterações com o DEBUG ativo.
-   `npm run dev`: Executa os testes unitários e espera por alterçãoes.
-   `npm run prod`: Executa o código com NODE_ENV=production.
-   `npm run coverage`: Executa os testes unitários e retorna a cobertura dos códigos através do [nyc](https://github.com/istanbuljs/nyc/)
-   `npm run release`: Inicia uma nova release de versão incrementando o `patch`, [git flow](https://github.com/nvie/gitflow/) release start.
-   `npm run release:minor`: Inicia uma nova release de versão incrementando o `minor`, [git flow](https://github.com/nvie/gitflow/) release start.
-   `npm run release:major`: Inicia uma nova release de versão incrementando o `major`, [git flow](https://github.com/nvie/gitflow/) release start.
-   `npm run release:finish`: Finaliza a release, ou seja, realiza o [git flow](https://github.com/nvie/gitflow/) release finish.

## FVI - Dynamoose Core

Biblioteca que disponibiliza um serviços [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) para acessar e alterar dados no _AWS DynamoDB_ através da interface [Model](https://dynamoosejs.com/api/model/) do [dynamoose.js](https://dynamoosejs.com/).

## Configuração

A configuração é na verdade o _Model_ do _dynamoose_ que já possui os métodos necessários para a implementação dos serviçoes auxiliares de _CRUD_. Podemos considerar a utilização da lib [i-dynamoose-repository](https://console.aws.amazon.com/codesuite/codecommit/repositories/i-dynamoose-repository/browse?region=us-east-1) para mapear e retornar o _Model_ do dynamoose para uma instância _AWS DynamoDB_.

-   Exemplo utilizando a lib `i-dynamoose-repository`

```javascript
const app = require('fvi-dynamoose-core')
const repository = require('fvi-dynamoose-repository')

repo = repository()

repo = repo.map(
    'model1',
    {
        id: hashKeyString(),
        tenantId: rangeKeyString(),
        prop1: requiredString(),
        prop2: optionalString(),
    },
    { saveUnknown: true },
    { update: true }
)

const model = repo.get('model1')

const services = app(model)
```

## Mode de Usar

```javascript
const app = require('fvi-dynamoose-core')

// Passing Dynamoose.Model Object
const services = app(model)

services.['hashWithRangeService'|'hashLikeIdService'|'hashLikeIdRangeLikeTenantService']
    .['create'|'update'|'query'|'queryByHashKey'|'queryById'|'delete']
    (
        {...params}
    )
    .then(console.log)
    .catch(console.error)
```

## Somente usando o hash key

> `{ 'any_hashkey-name': 'value' }`

Neste serviço podemos ter um _CRUD_ onde a tabela _dynamodb_ sendo tratada terá em seu schema um [HashKey](https://dynamoosejs.com/api/schema/) configurado. Seguem métodos disponívels:

> `services.hashOnlyService

-   `.create(hash: Object, obj: Object)`: Cria um novo registro passando o `hash` em um _Object_, e.g. `{ id: 'value' }` e o _Object_ completo com as propriedades.
-   `.update(hash: Object, obj: Object)`: Atualiza um registro passando o `hash` como um _Object_, e.g. `{ id: 'value' }`, e o _Object_ completo com todas as propriedades.
-   `.queryByHashKey(hash: Object)`: Consulta um registro passando o `hash` como um _Object_, e.g. `{ id: 'value' }`.
-   `.query(startHashKey: String, limit: Number)`: Consulta um ou mais registros paginados.
-   `.delete(hash: Object)`: Excluir um registro, passando o `hash` como uma _Object_, e.g. `{ id: 'value' }` .

### Tabela dynamo com hash key e range key

> `{ 'qualquer-hask-key-name': 'value', 'qualquer-range-key-name': 'value' }`

Neste serviço podemos ter um _CRUD_ onde a tabela _dynamodb_ sendo tratada terá em seu schema um [HashKey](https://dynamoosejs.com/api/schema/) e um [RangeKey](https://dynamoosejs.com/api/schema/) configurados. Estão disponíveis os seguintes métodos:

> `services.hashWithRangeService`

-   `.create(hash: Object, range: Object, obj: Object)`: Cria um novo registro passando o `hash` como um _Object_, e.g. `{ id: 'value' }`, o range, e.g. `{ status: 'value' }` e o _Object_ completo com todas as propriedades.
-   `.update(hash: Object, range: Object, obj: Object)`: Atualiza um registro passando o `hash` como um _Object_, e.g. `{ id: 'value' }`, o range, e.g. `{ status: 'value' }` e o _Object_ completo com todas as propriedades.
-   `.queryByHashKey(hash: Object)`: Consulta um registro passando o `hash` como um _Object_, e.g. `{ id: 'value' }`.
-   `.query(range: Object, startHashKey: Object, limit: Number)`: Consulta um ou mais registros paginados, passando o `range` como um _Object_, e.g. `{ status: 'value' }`.
-   `.delete(hash: Object, range: Object)`: Excluir um registro, passando o `hash` como um _Object_, e.g. `{ id: 'value'}` e `range`, e.g. `{ status: 'value' }`.

### Tabela dynamo com HashKey como '**id**'

> `{ id: 'hashKey' }`

Neste serviço podemos ter um _CRUD_ onde a tabela _dynamodb_ sendo tratada terá em seu schema um [HashKey](https://dynamoosejs.com/api/schema/) já configurado como a propriedade `id`. Estão disponíveis os seguintes métodos:

> `services.hashLikeIdService`

-   `.create(obj: Object)`: Cria um novo registro passando um _Object_, e.g. `{ id: 'value', prop1: 'value', etc: 'etc...' }`.
-   `.update(id: String, obj: Object)`: Atualiza um registro passando o `id` como uma _String_, e.g. `'value'`, e o _Object_ completo com todas as propriedades.
-   `.queryById(id: String)`: Consulta um registro passando o `id` como uma _String_, e.g. `'value'`.
-   `.query(startHashKey: String, limit: Number)`: Consulta um ou mais registros paginados.
-   `.delete(id: String)`: Excluir um registro, passando o `id` como uma _String_, e.g. `'value'` .

### Tabela dynamo com hash key como '**id**' e range key como '**tenantId**'

> `{ id: 'hashKey', tenantId: 'rangeKey' }`

Neste serviço podemos ter um _CRUD_ onde a tabela _dynamodb_ sendo tratada terá em seu schema um [HashKey](https://dynamoosejs.com/api/schema/) já configurado como a propriedade `id` e o . configurado para a propriedade `tenantId`, ajudando a implementar o padrão arquitetural de software chamado [multi-tenancy](https://en.wikipedia.org/wiki/Multitenancy).

Neste serviço temos a necessidade de chamar ele passado o valor do `tenantId` para que retorne os métodos do serviço, o _CRUD_. Este serviço vai gerenciar o `tenantId`, ou seja, tem um comportamento diferente dos serviços anteriores, onde, não passamos informação alguma à ser gerenciada. Segu um exemplo:

```javascript
const services = app(model)

const tenant1 = service.hashLikeIdRangeLikeTenantService('tenant-1')

tenant1.update('id-value', { prop1: 'xxx' }) // then().catch()

const tenant2 = service.hashLikeIdRangeLikeTenantService('tenant-1')

tenant2.create({ id: 'id-value', prop2: 'yyy' }) // then().catch()
```

> `services.hashLikeIdRangeLikeTenantService('tenant-id')`

-   `.create(obj: Object)`: Cria um novo registro passando um _Object_, e.g. `{ id: 'value', prop: 'xxx' }`.
-   `.update(id: String, obj: Object)`: Atualiza um registro passando o `id` como uma _String_, e.g. `'value'` e o _Object_ completo com todas as propriedades.
-   `.queryById(id: String)`: Consulta um registro passando o `id` como um _String_, e.g. `'value'`.
-   `.query(startKey: Object, limit: Number)`: Consulta um ou mais registros paginados.
-   `.delete(id: String)`: Excluir um registro, passando o `id` como um _String_, e.g. `'value'`.

## Padrões de retorno

> Para funções de mutação de dados, que modificam de alguma maneira o _DynamodDB_ retornam no formato abaixo:

```json
{
    "status": 200,
    "data": {
        "id": "value",
        "status": "value"
    }
}
```

-   `status === 201`: Novo registro criado
-   `status === 200`: Alteração ou exclusão do registro
-   `status === 400`: Erro de validação e consistência nos dados.
-   `status === 500`: Erro de crítico e inesperado.

> Para funções de consulta de dados, que não modificam o _DynamodDB_ retornam no formato abaixo:

```json
{
    "status": 200,
    "data": {
        "LastKey": { "id": "prox-value" },
        "Count": 1,
        "Items": [
            {
                "id": "value",
                "status": "value"
            }
        ]
    }
}
```

-   `status === 200`: Consulta realizada com sucesso
-   `status === 400`: Erro de validação e consistência nos dados.
-   `status === 500`: Erro de crítico e inesperado.
