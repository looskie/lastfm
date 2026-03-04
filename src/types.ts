export type Endpoint<
  Method extends string,
  Params extends Record<string, unknown> = {},
  Response = unknown,
> = {
  method: Method;
  params: Params;
  response: Response;
};

export type MethodNames<E> = E extends { method: infer M extends string }
  ? M
  : never;

export type ParamsFor<E, M> =
  Extract<E, { method: M }> extends {
    params: infer P;
  }
    ? P
    : never;

export type ResponseFor<E, M> =
  Extract<E, { method: M }> extends {
    response: infer R;
  }
    ? R
    : never;

type PickRequiredKeys<T> = {
  [K in keyof T as undefined extends T[K] ? never : K]: T[K];
};

export type RequestArgs<E, M> = [keyof ParamsFor<E, M>] extends [never]
  ? [params?: undefined]
  : [keyof PickRequiredKeys<ParamsFor<E, M>>] extends [never]
    ? [params?: ParamsFor<E, M>]
    : [params: ParamsFor<E, M>];
