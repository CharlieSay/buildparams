import { buildParams } from '../src/index';

describe('buildParams', () => {
  it('handles simple key-value pairs', () => {
    expect(buildParams({ name: 'John', age: 30 })).toBe('name=John&age=30');
  });

  it('handles array values with different encodings', () => {
    const params = { tags: ['typescript', 'npm'] };
    expect(buildParams(params)).toBe('tags=typescript&tags=npm');
    expect(buildParams(params, { arrayEncoding: 'bracket' })).toBe(
      'tags%5B%5D=typescript&tags%5B%5D=npm'
    );
    expect(buildParams(params, { arrayEncoding: 'index' })).toBe(
      'tags%5B0%5D=typescript&tags%5B1%5D=npm'
    );
    expect(buildParams(params, { arrayEncoding: 'comma' })).toBe(
      'tags=typescript%2Cnpm'
    );
  });

  it('handles null and undefined values', () => {
    expect(buildParams({ a: null, b: undefined, c: 'value' })).toBe(
      'a=&b=&c=value'
    );
    expect(
      buildParams({ a: null, b: undefined, c: 'value' }, { skipNull: true })
    ).toBe('c=value');
  });

  it('handles empty strings', () => {
    expect(buildParams({ a: '', b: 'value' })).toBe('a=&b=value');
    expect(buildParams({ a: '', b: 'value' }, { skipEmptyString: true })).toBe(
      'b=value'
    );
  });

  it('handles boolean values', () => {
    expect(buildParams({ a: true, b: false })).toBe('a=true&b=false');
    expect(
      buildParams({ a: true, b: false }, { booleanFormat: 'numeric' })
    ).toBe('a=1&b=0');
  });

  it('handles nested objects', () => {
    expect(buildParams({ user: { name: 'John', age: 30 } })).toBe(
      'user%5Bname%5D=John&user%5Bage%5D=30'
    );
    expect(
      buildParams({ user: { name: 'John', age: 30 } }, { allowDots: true })
    ).toBe('user.name=John&user.age=30');
  });

  it('handles dates', () => {
    const date = new Date('2023-04-01T12:00:00Z');
    expect(buildParams({ date })).toBe('date=2023-04-01T12%3A00%3A00.000Z');
    expect(
      buildParams({ date }, { serialiseDate: (d) => d.toUTCString() })
    ).toBe('date=Sat%2C%2001%20Apr%202023%2012%3A00%3A00%20GMT');
  });

  it('handles complex nested structures', () => {
    const params = { a: 1, b: { c: 2, d: [3, 4], e: { f: 5 } } };
    expect(buildParams(params)).toBe(
      'a=1&b%5Bc%5D=2&b%5Bd%5D=3&b%5Bd%5D=4&b%5Be%5D%5Bf%5D=5'
    );
  });

  it('handles arrays of objects', () => {
    const params = {
      users: [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ],
    };
    expect(buildParams(params, { arrayEncoding: 'index' })).toBe(
      'users%5B0%5D%5Bid%5D=1&users%5B0%5D%5Bname%5D=Alice&users%5B1%5D%5Bid%5D=2&users%5B1%5D%5Bname%5D=Bob'
    );
  });

  it('sorts the resulting key-value pairs alphabetically', () => {
    expect(buildParams({ b: 2, a: 1, c: 3 }, { sort: true })).toBe(
      'a=1&b=2&c=3'
    );
  });

  it('adds query prefix when specified', () => {
    expect(buildParams({ a: 1, b: 2 }, { addQueryPrefix: true })).toBe(
      '?a=1&b=2'
    );
  });

  it('uses custom encoder when provided', () => {
    const customEncoder = (str: string) => str.replace(/[aeiou]/g, '_');
    expect(buildParams({ test: 'hello' }, { encoder: customEncoder })).toBe(
      't_st=h_ll_'
    );
  });
});
