/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/export */
/* eslint-disable @typescript-eslint/ban-types */
declare module "expo-router" {
  import type { LinkProps as OriginalLinkProps } from 'expo-router/build/link/Link';
  import type { Router as OriginalRouter } from 'expo-router/src/types';
  export * from 'expo-router/build';

  // prettier-ignore
  type StaticRoutes = `/` | `/(drawer)/_layout` | `/_layout` | `/(drawer)/contacts/add` | `/contacts/add` | `/(drawer)/contacts/` | `/contacts/` | `/(drawer)/contacts` | `/(drawer)/ledger/link` | `/ledger/link` | `/(drawer)/sessions/` | `/sessions/` | `/(drawer)/sessions` | `/(drawer)/settings/auth` | `/settings/auth` | `/(drawer)/settings/notifications` | `/settings/notifications` | `/(drawer)/token/add` | `/token/add` | `/(drawer)/user` | `/user` | `/_sitemap` | `/accounts/create` | `/accounts/` | `/addresses` | `/confirm` | `/ledger/sign` | `/link/` | `/link/token` | `/onboard/approver` | `/onboard/auth` | `/onboard/` | `/onboard/notifications` | `/onboard/user` | `/scan/`;
  // prettier-ignore
  type DynamicRoutes<T extends string> = `/(drawer)/${SingleRoutePart<T>}/(home)/_layout` | `/${SingleRoutePart<T>}/_layout` | `/(drawer)/${SingleRoutePart<T>}/(home)/activity` | `/${SingleRoutePart<T>}/activity` | `/(drawer)/${SingleRoutePart<T>}/(home)/` | `/${SingleRoutePart<T>}/` | `/(drawer)/${SingleRoutePart<T>}/(home)` | `/(drawer)/${SingleRoutePart<T>}/policies/${SingleRoutePart<T>}/${SingleRoutePart<T>}/` | `/${SingleRoutePart<T>}/policies/${SingleRoutePart<T>}/${SingleRoutePart<T>}/` | `/(drawer)/${SingleRoutePart<T>}/policies/${SingleRoutePart<T>}/${SingleRoutePart<T>}` | `/(drawer)/${SingleRoutePart<T>}/policies/${SingleRoutePart<T>}/approvers` | `/${SingleRoutePart<T>}/policies/${SingleRoutePart<T>}/approvers` | `/(drawer)/${SingleRoutePart<T>}/policies/${SingleRoutePart<T>}/` | `/${SingleRoutePart<T>}/policies/${SingleRoutePart<T>}/` | `/(drawer)/${SingleRoutePart<T>}/policies/${SingleRoutePart<T>}` | `/(drawer)/${SingleRoutePart<T>}/policies/` | `/${SingleRoutePart<T>}/policies/` | `/(drawer)/${SingleRoutePart<T>}/policies` | `/(drawer)/${SingleRoutePart<T>}/swap` | `/${SingleRoutePart<T>}/swap` | `/(drawer)/${SingleRoutePart<T>}/tokens` | `/${SingleRoutePart<T>}/tokens` | `/(drawer)/${SingleRoutePart<T>}/transfer` | `/${SingleRoutePart<T>}/transfer` | `/(drawer)/approver/${SingleRoutePart<T>}/` | `/approver/${SingleRoutePart<T>}/` | `/(drawer)/approver/${SingleRoutePart<T>}` | `/(drawer)/contacts/${SingleRoutePart<T>}` | `/contacts/${SingleRoutePart<T>}` | `/(drawer)/message/${SingleRoutePart<T>}/_layout` | `/message/${SingleRoutePart<T>}/_layout` | `/(drawer)/message/${SingleRoutePart<T>}/` | `/message/${SingleRoutePart<T>}/` | `/(drawer)/message/${SingleRoutePart<T>}` | `/(drawer)/message/${SingleRoutePart<T>}/policy` | `/message/${SingleRoutePart<T>}/policy` | `/(drawer)/token/${SingleRoutePart<T>}` | `/token/${SingleRoutePart<T>}` | `/(drawer)/transaction/${SingleRoutePart<T>}/_layout` | `/transaction/${SingleRoutePart<T>}/_layout` | `/(drawer)/transaction/${SingleRoutePart<T>}/` | `/transaction/${SingleRoutePart<T>}/` | `/(drawer)/transaction/${SingleRoutePart<T>}` | `/(drawer)/transaction/${SingleRoutePart<T>}/policy` | `/transaction/${SingleRoutePart<T>}/policy` | `/(drawer)/transaction/${SingleRoutePart<T>}/transaction` | `/transaction/${SingleRoutePart<T>}/transaction` | `/${CatchAllRoutePart<T>}` | `/${SingleRoutePart<T>}/name` | `/${SingleRoutePart<T>}/policies/${SingleRoutePart<T>}/${SingleRoutePart<T>}/add-selector` | `/${SingleRoutePart<T>}/policies/${SingleRoutePart<T>}/name` | `/${SingleRoutePart<T>}/policies/template` | `/${SingleRoutePart<T>}/receive` | `/approver/${SingleRoutePart<T>}/qr` | `/scan/${SingleRoutePart<T>}` | `/sessions/${SingleRoutePart<T>}` | `/sessions/connect/${SingleRoutePart<T>}`;
  // prettier-ignore
  type DynamicRouteTemplate = `/(drawer)/[account]/(home)/_layout` | `/(drawer)/[account]/(home)/activity` | `/(drawer)/[account]/(home)/` | `/(drawer)/[account]/policies/[key]/[contract]/` | `/(drawer)/[account]/policies/[key]/approvers` | `/(drawer)/[account]/policies/[key]/` | `/(drawer)/[account]/policies/` | `/(drawer)/[account]/swap` | `/(drawer)/[account]/tokens` | `/(drawer)/[account]/transfer` | `/(drawer)/approver/[address]/` | `/(drawer)/contacts/[address]` | `/(drawer)/message/[hash]/_layout` | `/(drawer)/message/[hash]/` | `/(drawer)/message/[hash]/policy` | `/(drawer)/token/[token]` | `/(drawer)/transaction/[hash]/_layout` | `/(drawer)/transaction/[hash]/` | `/(drawer)/transaction/[hash]/policy` | `/(drawer)/transaction/[hash]/transaction` | `/[...unmatched]` | `/[account]/name` | `/[account]/policies/[key]/[contract]/add-selector` | `/[account]/policies/[key]/name` | `/[account]/policies/template` | `/[account]/receive` | `/approver/[address]/qr` | `/scan/[address]` | `/sessions/[topic]` | `/sessions/connect/[id]`;

  type RelativePathString = `./${string}` | `../${string}` | '..';
  type AbsoluteRoute = DynamicRouteTemplate | StaticRoutes;
  type ExternalPathString = `http${string}`;
  type ExpoRouterRoutes = DynamicRouteTemplate | StaticRoutes | RelativePathString;
  type AllRoutes = ExpoRouterRoutes | ExternalPathString;

  /****************
   * Route Utils  *
   ****************/

  type SearchOrHash = `?${string}` | `#${string}`;
  type UnknownInputParams = Record<string, string | number | (string | number)[]>;
  type UnknownOutputParams = Record<string, string | string[]>;

  /**
   * Return only the RoutePart of a string. If the string has multiple parts return never
   *
   * string   | type
   * ---------|------
   * 123      | 123
   * /123/abc | never
   * 123?abc  | never
   * ./123    | never
   * /123     | never
   * 123/../  | never
   */
  type SingleRoutePart<S extends string> = S extends `${string}/${string}`
    ? never
    : S extends `${string}${SearchOrHash}`
    ? never
    : S extends ''
    ? never
    : S extends `(${string})`
    ? never
    : S extends `[${string}]`
    ? never
    : S;

  /**
   * Return only the CatchAll router part. If the string has search parameters or a hash return never
   */
  type CatchAllRoutePart<S extends string> = S extends `${string}${SearchOrHash}`
    ? never
    : S extends ''
    ? never
    : S extends `${string}(${string})${string}`
    ? never
    : S extends `${string}[${string}]${string}`
    ? never
    : S;

  // type OptionalCatchAllRoutePart<S extends string> = S extends `${string}${SearchOrHash}` ? never : S

  /**
   * Return the name of a route parameter
   * '[test]'    -> 'test'
   * 'test'      -> never
   * '[...test]' -> '...test'
   */
  type IsParameter<Part> = Part extends `[${infer ParamName}]` ? ParamName : never;

  /**
   * Return a union of all parameter names. If there are no names return never
   *
   * /[test]         -> 'test'
   * /[abc]/[...def] -> 'abc'|'...def'
   */
  type ParameterNames<Path> = Path extends `${infer PartA}/${infer PartB}`
    ? IsParameter<PartA> | ParameterNames<PartB>
    : IsParameter<Path>;

  /**
   * Returns all segements of a route.
   *
   * /(group)/123/abc/[id]/[...rest] -> ['(group)', '123', 'abc', '[id]', '[...rest]'
   */
  type RouteSegments<Path> = Path extends `${infer PartA}/${infer PartB}`
    ? PartA extends '' | '.'
      ? [...RouteSegments<PartB>]
      : [PartA, ...RouteSegments<PartB>]
    : Path extends ''
    ? []
    : [Path];

  /**
   * Returns a Record of the routes parameters as strings and CatchAll parameters
   *
   * There are two versions, input and output, as you can input 'string | number' but
   *  the output will always be 'string'
   *
   * /[id]/[...rest] -> { id: string, rest: string[] }
   * /no-params      -> {}
   */
  type InputRouteParams<Path> = {
    [Key in ParameterNames<Path> as Key extends `...${infer Name}`
      ? Name
      : Key]: Key extends `...${string}` ? (string | number)[] : string | number;
  } & UnknownInputParams;

  type OutputRouteParams<Path> = {
    [Key in ParameterNames<Path> as Key extends `...${infer Name}`
      ? Name
      : Key]: Key extends `...${string}` ? string[] : string;
  } & UnknownOutputParams;

  /**
   * Returns the search parameters for a route.
   */
  export type SearchParams<T extends AllRoutes> = T extends DynamicRouteTemplate
    ? OutputRouteParams<T>
    : T extends StaticRoutes
    ? never
    : UnknownOutputParams;

  /**
   * Route is mostly used as part of Href to ensure that a valid route is provided
   *
   * Given a dynamic route, this will return never. This is helpful for conditional logic
   *
   * /test         -> /test, /test2, etc
   * /test/[abc]   -> never
   * /test/resolve -> /test, /test2, etc
   *
   * Note that if we provide a value for [abc] then the route is allowed
   *
   * This is named Route to prevent confusion, as users they will often see it in tooltips
   */
  export type Route<T> = T extends string
    ? T extends DynamicRouteTemplate
      ? never
      :
          | StaticRoutes
          | RelativePathString
          | ExternalPathString
          | (T extends `${infer P}${SearchOrHash}`
              ? P extends DynamicRoutes<infer _>
                ? T
                : never
              : T extends DynamicRoutes<infer _>
              ? T
              : never)
    : never;

  /*********
   * Href  *
   *********/

  export type Href<T> = T extends Record<'pathname', string> ? HrefObject<T> : Route<T>;

  export type HrefObject<
    R extends Record<'pathname', string>,
    P = R['pathname']
  > = P extends DynamicRouteTemplate
    ? { pathname: P; params: InputRouteParams<P> }
    : P extends Route<P>
    ? { pathname: Route<P> | DynamicRouteTemplate; params?: never | InputRouteParams<never> }
    : never;

  /***********************
   * Expo Router Exports *
   ***********************/

  export type Router = Omit<OriginalRouter, 'push' | 'replace' | 'setParams'> & {
    /** Navigate to the provided href. */
    push: <T>(href: Href<T>) => void;
    /** Navigate to route without appending to the history. */
    replace: <T>(href: Href<T>) => void;
    /** Update the current route query params. */
    setParams: <T = ''>(params?: T extends '' ? Record<string, string> : InputRouteParams<T>) => void;
  };

  /** The imperative router. */
  export const router: Router;

  /************
   * <Link /> *
   ************/
  export interface LinkProps<T> extends OriginalLinkProps {
    href: Href<T>;
  }

  export interface LinkComponent {
    <T>(props: React.PropsWithChildren<LinkProps<T>>): JSX.Element;
    /** Helper method to resolve an Href object into a string. */
    resolveHref: <T>(href: Href<T>) => string;
  }

  /**
   * Component to render link to another route using a path.
   * Uses an anchor tag on the web.
   *
   * @param props.href Absolute path to route (e.g. `/feeds/hot`).
   * @param props.replace Should replace the current route without adding to the history.
   * @param props.asChild Forward props to child component. Useful for custom buttons.
   * @param props.children Child elements to render the content.
   */
  export const Link: LinkComponent;
  
  /** Redirects to the href as soon as the component is mounted. */
  export const Redirect: <T>(
    props: React.PropsWithChildren<{ href: Href<T> }>
  ) => JSX.Element;

  /************
   * Hooks *
   ************/
  export function useRouter(): Router;

  export function useLocalSearchParams<
    T extends AllRoutes | UnknownOutputParams = UnknownOutputParams
  >(): T extends AllRoutes ? SearchParams<T> : T;

  /** @deprecated renamed to `useGlobalSearchParams` */
  export function useSearchParams<
    T extends AllRoutes | UnknownOutputParams = UnknownOutputParams
  >(): T extends AllRoutes ? SearchParams<T> : T;

  export function useGlobalSearchParams<
    T extends AllRoutes | UnknownOutputParams = UnknownOutputParams
  >(): T extends AllRoutes ? SearchParams<T> : T;

  export function useSegments<
    T extends AbsoluteRoute | RouteSegments<AbsoluteRoute> | RelativePathString
  >(): T extends AbsoluteRoute ? RouteSegments<T> : T extends string ? string[] : T;
}
