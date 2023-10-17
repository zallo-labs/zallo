import { FragmentType, gql, useFragment } from '@api';
import { Risk } from '@api/generated/graphql';
import { StyleProp, View, ViewStyle } from 'react-native';
import { SegmentedButtons, SegmentedButtonsProps } from 'react-native-paper';
import { useMutation } from 'urql';
import { ListHeader } from '../list/ListHeader';
import { StyleSheet } from 'react-native';
import { showInfo } from '~/components/provider/SnackbarProvider';
import { CONFIG } from '~/util/config';
import * as Linking from 'expo-linking';

const Proposal = gql(/* GraphQL */ `
  fragment RiskRating_Proposal on Proposal {
    id
    hash
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
  const { hash, riskLabel } = useFragment(Proposal, props.proposal);
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
          labelProposal({ input: { hash: hash, risk: v as Risk } });

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
