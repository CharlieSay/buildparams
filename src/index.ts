export interface BuildParamsOptions {
  arrayEncoding?: 'repeat' | 'bracket' | 'index' | 'comma';
  skipNull?: boolean;
  skipEmptyString?: boolean;
  booleanFormat?: 'literal' | 'numeric';
  allowDots?: boolean;
  sort?: boolean;
  addQueryPrefix?: boolean;
  encoder?: (str: string) => string;
  serialiseDate?: (date: Date) => string;
}

const defaultOptions: Required<BuildParamsOptions> = {
  arrayEncoding: 'repeat',
  skipNull: false,
  skipEmptyString: false,
  booleanFormat: 'literal',
  allowDots: false,
  sort: false,
  addQueryPrefix: false,
  encoder: encodeURIComponent,
  serialiseDate: (date: Date) => date.toISOString(),
};

export function buildParams(
  params: Record<string, any>,
  options: BuildParamsOptions = {}
): string {
  const mergedOptions: Required<BuildParamsOptions> = {
    ...defaultOptions,
    ...options,
  };
  const result: string[] = [];

  function encode(value: string): string {
    return typeof mergedOptions.encoder === 'function'
      ? mergedOptions.encoder(value)
      : encodeURIComponent(value);
  }

  function serializeKey(key: string, value: any, prefix = ''): void {
    if (value === null || value === undefined) {
      if (!mergedOptions.skipNull) {
        result.push(`${encode(prefix + key)}=`);
      }
    } else if (value === '') {
      if (!mergedOptions.skipEmptyString) {
        result.push(`${encode(prefix + key)}=`);
      }
    } else if (Array.isArray(value)) {
      serializeArray(key, value, prefix);
    } else if (typeof value === 'object' && !(value instanceof Date)) {
      serializeObject(key, value, prefix);
    } else {
      result.push(`${encode(prefix + key)}=${encode(serializeValue(value))}`);
    }
  }

  function serializeArray(key: string, arr: any[], prefix = ''): void {
    switch (mergedOptions.arrayEncoding) {
      case 'repeat':
        arr.forEach((value) => serializeKey(key, value, prefix));
        break;
      case 'bracket':
        arr.forEach((value) => serializeKey(`${key}[]`, value, prefix));
        break;
      case 'index':
        arr.forEach((value, index) =>
          serializeKey(`${key}[${index}]`, value, prefix)
        );
        break;
      case 'comma':
        if (arr.length) {
          result.push(
            `${encode(prefix + key)}=${arr
              .map(serializeValue)
              .map(encode)
              .join('%2C')}`
          );
        }
        break;
    }
  }

  function serializeObject(
    key: string,
    obj: Record<string, any>,
    prefix = ''
  ): void {
    Object.entries(obj).forEach(([k, v]) => {
      const newKey = mergedOptions.allowDots ? `${key}.${k}` : `${key}[${k}]`;
      serializeKey(newKey, v, prefix);
    });
  }

  function serializeValue(value: any): string {
    if (value instanceof Date) {
      return typeof mergedOptions.serialiseDate === 'function'
        ? mergedOptions.serialiseDate(value)
        : value.toISOString();
    } else if (typeof value === 'boolean') {
      return mergedOptions.booleanFormat === 'numeric'
        ? value
          ? '1'
          : '0'
        : String(value);
    }
    return String(value);
  }

  Object.entries(params).forEach(([key, value]) => serializeKey(key, value));

  if (mergedOptions.sort) {
    result.sort();
  }

  const queryString = result.join('&');
  return mergedOptions.addQueryPrefix ? `?${queryString}` : queryString;
}
