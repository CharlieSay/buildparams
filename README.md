# simple-param-builder

A flexible TypeScript function to convert objects into URL-encoded query strings.

## Installation

```bash
npm install simple-param-builder
```

## Usage

```typescript
import { buildParams } from 'simple-param-builder';

const params = {
  name: 'John Doe',
  age: 30,
  tags: ['developer', 'typescript'],
  settings: {
    newsletter: true,
    theme: 'dark',
  },
};

const queryString = buildParams(params);
console.log(queryString);
// Output: name=John%20Doe&age=30&tags=developer&tags=typescript&settings%5Bnewsletter%5D=true&settings%5Btheme%5D=dark
```

## API

### buildParams(params: Record<string, any>, options?: BuildParamsOptions): string

Converts an object of key-value pairs into a URL-encoded query string.

#### Options

- `arrayEncoding`: How to encode array values ('repeat', 'bracket', 'index', or 'comma')
- `skipNull`: Whether to skip null and undefined values
- `skipEmptyString`: Whether to skip empty string values
- `booleanFormat`: How to format boolean values ('literal' or 'numeric')
- `allowDots`: Whether to use dot notation for nested objects
- `sort`: Whether to sort the resulting key-value pairs alphabetically
- `addQueryPrefix`: Whether to add a '?' prefix to the result
- `encoder`: A custom function for encoding strings (default: encodeURIComponent)
- `serialiseDate`: A custom function for serializing Date objects (default: toISOString())

## License

MIT
