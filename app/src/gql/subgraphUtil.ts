import { DateTime } from "luxon";

export const dateTimeFromSubgraph = (timestamp: string) => DateTime.fromSeconds(parseInt(timestamp));