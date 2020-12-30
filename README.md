# ReviveJS

[![Version](https://img.shields.io/npm/v/revivejs.svg)](https://npmjs.org/package/revivejs)
![CI](https://github.com/mflorin/revivejs/workflows/CI/badge.svg)
[![Downloads/week](https://img.shields.io/npm/dw/revivejs.svg)](https://npmjs.org/package/revivejs)
[![License](https://img.shields.io/npm/l/revivejs)](https://github.com/mflorin/revivejs/blob/main/package.json)

ReviveJS is a Javascript json deserializer library for reviving objects along with their prototype/behavior.

Think about all the times you had to call an API, retrieve and parse the JSON response and then map that structure to your own models or build behavior around those structures.
ReviveJS simplifies this entire process by reviving entire chains of models in one shot.

```typescript
import { revive } from 'revivejs'

class Person {
    name = ''
    public sayHi() {
        console.log(`Hi, I'm ${this.name}.`)
    }
}

const data = '{"name": "John Smith"}'
const person = revive(data, Person)
person.sayHi() // Hi, I'm John Smith.
```

## Install

`ReviveJS` can be installed using npm
```shell
$ npm install revivejs
```

or yarn
```shell
$ yarn add revivejs
```

## Documentation

Please check out the full [Documentation](https://mflorin.gitbook.io/revivejs/) for more details.
