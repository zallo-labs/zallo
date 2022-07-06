# Tests

## isValidSignature
- should return the magic value if the signature is valid
- should be reverted if the hash doesn't match the signature
- should be reverted if the signatures don't meet threshold


## validateTransaction
Not tested as this function defers to isValidSignature


## executeTransaction
- should revert when not called by the bootloader[1]
- should successfully execute a transaction
- should set the transaction as executed
- should emit the response
- should pass through the revert message if the called contract reverts with a message
- should revert if the called contract reverts

[1]: Only test actually executed on executeTransaction, all other tests occur on testExecuteTransaction since only the bootloader can call the function


## executeTransactionFromOutside
*Assumes that validateTransaction and executeTransaction are called*, thus inheriting these tests in a sense

- should be callable from any address

