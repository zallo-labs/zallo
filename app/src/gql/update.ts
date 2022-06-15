import { DataProxy } from '@apollo/client';

export type QueryOpts<TVariables> = DataProxy.Query<TVariables, unknown>;
