# ReviveJS

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

Please check out the full [Documentation](https://mflorin.gitbook.io/revivejs/) for more details.
