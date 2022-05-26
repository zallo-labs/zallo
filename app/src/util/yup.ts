import { ethers } from 'ethers';
import * as Yup from 'yup';

export const ADDR_YUP_SCHEMA = Yup.string()
  .required("Required")
  .test({
    message: 'Must be a valid address',
    test: (value: string) => ethers.utils.isAddress(value),
  });
