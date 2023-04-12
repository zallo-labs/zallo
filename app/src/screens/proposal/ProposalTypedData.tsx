import assert from 'assert';
import { ParamType } from 'ethers/lib/utils';
import { useMemo } from 'react';
import { TypedData } from '~/components/TypedData/TypedData';
import { TypedDataComponent } from '~/components/TypedData/TypedDataObject';
import { Proposal } from '@api/proposal';
import { useContractFunction } from '@api/contracts';

const paramToComponent = (param: ParamType, value: unknown): TypedDataComponent => {
  if (param.components === null) {
    return {
      name: param.name,
      type: param.type,
      value,
    };
  }

  assert(Array.isArray(param.components));
  return {
    name: param.name,
    type: param.type,
    components: param.components.map((component, i) =>
      paramToComponent(component, (value as unknown[])[i]),
    ),
  };
};

export interface ProposalTypedDataProps {
  proposal: Proposal;
}

export const ProposalTypedData = ({ proposal }: ProposalTypedDataProps) => {
  const func = useContractFunction(proposal);

  const data = useMemo((): TypedDataComponent => {
    if (!proposal.data) return { value: undefined };

    const decoded = func?.iface.decodeFunctionData(func.fragment, proposal.data);
    if (!func || !decoded) return { value: proposal.data };

    return {
      name: func.fragment.name,
      type: func.fragment.type,
      components: func.fragment.inputs.map((component, i) =>
        paramToComponent(component, decoded[i]),
      ),
    };
  }, [func, proposal.data]);

  return <TypedData data={data} />;
};
