# ts-to-io

Converts Typescript type and interface definitions into io-ts type validators.

## Usage

NOTE: The validator generation is not intended to be performed at runtime. You should first generate the validators locally and then include them in the program source.

```typescript
import { getValidatorsFromString } from "ts-to-io"

const sourceString = `
...
`

const validators = getValidatorsFromString(sourceString)
```
