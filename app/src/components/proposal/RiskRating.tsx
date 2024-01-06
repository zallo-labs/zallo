import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import * as Linking from 'expo-linking';
import { SegmentedButtons, SegmentedButtonsProps } from 'react-native-paper';
import { useMutation } from 'urql';

import { showInfo } from '~/components/provider/SnackbarProvider';
import { FragmentType, gql, useFragment } from '~/gql/api';
import { Risk } from '~/gql/api/generated/graphql';
import { CONFIG } from '~/util/config';
import { ListHeader } from '../list/ListHeader';

const Proposal = gql(/* GraphQL */ `
  fragment RiskRating_Proposal on Proposal {
    id
    riskLabel
  }
`);

const Label = gql(/* GraphQL */ `
  mutation RiskRating_Label($input: LabelProposalRiskInput!) {
    labelProposalRisk(input: $input) {
      ...RiskRating_Proposal
    }
  }
`);

export interface RiskLabelProps {
  proposal: FragmentType<typeof Proposal>;
  style?: StyleProp<ViewStyle>;
}

export function RiskRating(props: RiskLabelProps) {
  const { id, riskLabel } = useFragment(Proposal, props.proposal);
  const labelProposal = useMutation(Label)[1];

  const buttons: (SegmentedButtonsProps['buttons'][0] & { value: Risk })[] = [
    { value: 'Low', label: 'Low risk', showSelectedCheck: true },
    { value: 'Medium', label: 'Medium risk', showSelectedCheck: true },
    { value: 'High', label: 'High risk', showSelectedCheck: true },
  ];

  return (
    <View style={[styles.container, props.style]}>
      <ListHeader containerStyle={styles.listHeaderContainer}>Rate the proposal</ListHeader>
      <SegmentedButtons
        value={riskLabel || ''}
        onValueChange={(v) => {
          labelProposal({ input: { id, risk: v as Risk } });

          if (!riskLabel) {
            showInfo('+1 point for rating this proposal 🎉', {
              action: { label: 'Learn more', onPress: () => Linking.openURL(CONFIG.riskRatingUrl) },
            });
          }
        }}
        buttons={buttons}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  listHeaderContainer: {
    marginHorizontal: undefined,
  },
});
