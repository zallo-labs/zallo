import { SearchParams, useLocalSearchParams, useRouter } from 'expo-router';
import { gql } from '@api/generated';
import { Image } from 'expo-image';
import { Address, asAddress, isAddressLike } from 'lib';
import _ from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ScrollView, StyleSheet } from 'react-native';
import { AddressIcon } from '~/components/Identicon/AddressIcon';
import { FormSubmitButton } from '~/components/fields/FormSubmitButton';
import { FormTextField } from '~/components/fields/FormTextField';
import { Indented } from '~/components/fields/Indented';
import { Actions } from '~/components/layout/Actions';
import { UnknownTokenIcon } from '~/components/token/TokenIcon';
import { ADDRESS_FIELD_RULES } from '~/util/form.rules';
import { AppbarMore } from '~/components/Appbar/AppbarMore';
import { Menu } from 'react-native-paper';
import { useQuery } from '~/gql';
import { useMutation } from 'urql';
import { useConfirmRemoval } from '~/hooks/useConfirm';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';

const Query = gql(/* GraphQL */ `
  query TokenScreen($token: Address!) {
    token(input: { address: $token }) {
      id
      address
      userOwned
      ethereumAddress
      name
      symbol
      decimals
      iconUri
    }

    metadata: tokenMetadata(input: { address: $token }) {
      id
      ethereumAddress
      name
      symbol
      decimals
      iconUri
    }
  }
`);

const UpsertToken = gql(/* GraphQL */ `
  mutation TokenScreenUpsert($input: UpsertTokenInput!) {
    upsertToken(input: $input) {
      id
      ethereumAddress
      name
      symbol
      decimals
      iconUri
    }
  }
`);

const RemoveToken = gql(/* GraphQL */ `
  mutation TokenScreenRemoval($token: Address!) {
    removeToken(input: { address: $token })
  }
`);

interface Inputs {
  address: Address;
  ethereumAddress?: Address;
  name: string;
  symbol: string;
  decimals: number;
  iconUri?: string;
}

export type TokenScreenRoute = `/(drawer)/token/[token]`;
export type TokenScreenParams = SearchParams<TokenScreenRoute>;

export default function TokenScreen() {
  const { token } = useLocalSearchParams<TokenScreenParams>();

  return <InternalTokenScreen token={asAddress(token)} />;
}

export interface InternalTokenScreenProps {
  token?: Address;
}

export function InternalTokenScreen(props: InternalTokenScreenProps) {
  const router = useRouter();
  const upsert = useMutation(UpsertToken)[1];
  const remove = useMutation(RemoveToken)[1];
  const confirmRemoval = useConfirmRemoval({
    message: 'Are you sure you want to remove this token?',
  });

  const { control, handleSubmit, watch, reset } = useForm<Inputs>({
    defaultValues: { address: props.token },
  });
  const [address, ethereumAddress, iconUri] = watch(['address', 'ethereumAddress', 'iconUri']);

  const query = useQuery(
    Query,
    { token: address as Address },
    {
      pause: !address || !isAddressLike(address),
      context: useMemo(() => ({ suspense: false }), []),
    },
  ).data;

  useEffect(() => {
    const m = query?.token ?? query?.metadata;
    if (address && isAddressLike(address) && m) {
      reset({
        ...Object.fromEntries(
          Object.entries(_.omit(m, ['__typename', 'id', 'userOwned'])).filter(
            (_, v) => v !== null && v !== undefined,
          ),
        ),
        address,
        ...(typeof m.decimals === 'number' && { decimals: `${m.decimals}` as unknown as number }), // Only works if reset as string, even though input type is number
      });
    }
  }, [reset, address, query?.metadata, query?.token]);

  const [isValidIcon, setValidIcon] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppbarOptions
        headline="Tokens"
        trailing={
          query?.token?.userOwned
            ? (props) => (
                <AppbarMore iconProps={props}>
                  {({ close }) => (
                    <Menu.Item
                      title="Remove token"
                      onPress={async () => {
                        close();
                        if (await confirmRemoval()) {
                          await remove({ token: query.token!.address });
                          router.back();
                        }
                      }}
                    />
                  )}
                </AppbarMore>
              )
            : undefined
        }
      />

      <Indented
        leading={
          isAddressLike(address)
            ? (props) => <AddressIcon address={asAddress(address)} {...props} />
            : undefined
        }
      >
        <FormTextField
          label="Address"
          name="address"
          placeholder="0x..."
          multiline
          control={control}
          rules={{
            ...ADDRESS_FIELD_RULES,
            required: true,
          }}
          containerStyle={styles.field}
        />
      </Indented>

      <Indented
        leading={
          isAddressLike(ethereumAddress)
            ? (props) => <AddressIcon address={asAddress(ethereumAddress)} {...props} />
            : undefined
        }
      >
        <FormTextField
          label="Ethereum address"
          name="ethereumAddress"
          placeholder="0x..."
          multiline
          control={control}
          containerStyle={styles.field}
        />
      </Indented>

      <Indented>
        <FormTextField
          label="Name"
          name="name"
          placeholder="USD Coin"
          rules={{ required: true }}
          control={control}
          containerStyle={styles.field}
        />
      </Indented>

      <Indented>
        <FormTextField
          label="Symbol"
          name="symbol"
          placeholder="USDC"
          rules={{ required: true }}
          control={control}
          containerStyle={styles.field}
        />
      </Indented>

      <Indented>
        <FormTextField
          label="Decimals"
          name="decimals"
          placeholder="6"
          rules={{ required: true }}
          control={control}
          containerStyle={styles.field}
          inputMode="numeric"
        />
      </Indented>

      <Indented
        leading={
          iconUri
            ? ({ size }) => (
                <Image
                  source={[{ uri: iconUri }]}
                  onError={() => setValidIcon(false)}
                  onLoad={() => setValidIcon(true)}
                  style={{ width: size, height: size }}
                />
              )
            : UnknownTokenIcon
        }
      >
        <FormTextField
          label="Icon URL"
          name="iconUri"
          multiline
          rules={{
            pattern: {
              value: /https?:\/\//,
              message: 'Must start with https or http',
            },
            validate: (v) => !v || isValidIcon || 'Invalid',
          }}
          control={control}
          containerStyle={styles.field}
        />
      </Indented>

      <Actions>
        <FormSubmitButton
          mode="contained"
          requireChanges
          control={control}
          onPress={handleSubmit(async (input) => {
            await upsert({
              input: { ...input, decimals: parseFloat(input.decimals as unknown as string) },
            });
          })}
        >
          Save
        </FormSubmitButton>
      </Actions>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    marginTop: 8,
    marginHorizontal: 16,
    gap: 8,
  },
  field: {
    flex: 1,
  },
});
