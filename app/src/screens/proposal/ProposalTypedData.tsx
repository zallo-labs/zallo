import assert from 'assert';
import { ParamType } from 'ethers/lib/utils';
import { useMemo } from 'react';
import { TypedData } from '~/components/TypedData/TypedData';
import { TypedDataComponent } from '~/components/TypedData/TypedDataObject';
import { Proposal } from '@api/proposal';
import { useContractMethod } from '@api/method';

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
  const method = useContractMethod(proposal);

  const data = useMemo((): TypedDataComponent => {
    if (!proposal.data) return { value: undefined };

    const decoded = method?.contract.decodeFunctionData(method.fragment, proposal.data);
    if (!method || !decoded) return { value: proposal.data };

    return {
      name: method.fragment.name,
      type: method.fragment.type,
      components: method.fragment.inputs.map((component, i) =>
        paramToComponent(component, decoded[i]),
      ),
    };
  }, [method, proposal.data]);

  return <TypedData data={data} />;
};
