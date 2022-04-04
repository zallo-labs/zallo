import { RequireAtLeastOne } from "~/util/typing";

export const MERGE_COMBINER = <Sub, Api>(sub: Sub, api: Api): Sub & Api => ({ ...api, ...sub });

export type Combiner<Sub, Api, Combined> =
  | RequireBothCombiner<Sub, Api, Combined>
  | AtLeastSubCombiner<Sub, Api, Combined>
  | AtLeastApiCombiner<Sub, Api, Combined>;

export interface RequireBothCombiner<Sub, Api, Combined> {
  requireBoth: (sub: Sub, api: Api) => Combined;
}

export const isRequireBothCombiner = <Sub, Api, Combined>(
  c: Combiner<Sub, Api, Combined>
): c is RequireBothCombiner<Sub, Api, Combined> => "requireBoth" in c;

export interface AtLeastSubCombiner<Sub, Api, Combined> {
  atLeastSub: (sub: Sub, api?: Api) => Combined;
}

export const isAtLeastSubCombiner = <Sub, Api, Combined>(
  c: Combiner<Sub, Api, Combined>
): c is AtLeastSubCombiner<Sub, Api, Combined> => "atLeastSub" in c;

export interface AtLeastApiCombiner<Sub, Api, Combined> {
  atLeastApi: (sub: Sub | undefined, api: Api) => Combined;
}

export const isAtLeastApiCombiner = <Sub, Api, Combined>(
  c: Combiner<Sub, Api, Combined>
): c is AtLeastApiCombiner<Sub, Api, Combined> => "atLeastApi" in c;

export type AtLeastOneCombiner<Sub, Api, Combined> = RequireAtLeastOne<
  Partial<RequireBothCombiner<Sub, Api, Combined>> &
    Partial<AtLeastSubCombiner<Sub, Api, Combined>> &
    Partial<AtLeastApiCombiner<Sub, Api, Combined>>
>;
