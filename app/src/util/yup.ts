import { isAddress } from 'lib';
import * as Yup from 'yup';

export const ADDR_YUP_SCHEMA = Yup.string().required('Required').test({
  message: 'Must be a valid address',
  test: isAddress,
});
