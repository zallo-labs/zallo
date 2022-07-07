# Tests

## isValidSignature
- should return the magic value if the signature is valid
- should be reverted if the hash doesn't match the signature
- should be reverted if the signers don't meet the threshold


## validateTransaction
*Assumes that isValidSignature*

- should revert when the transaction has already been executed


## executeTransaction
- should revert when not called by the bootloader[1]
- should successfully execute a transaction with a single approver
- shoudl successfully execute a transaction with mutliple approvers
- should set the transaction as executed
- should emit the response to the tx
- should pass through the revert message if the called contract reverts with a message
- should revert if the called contract reverts

[1]: Only test actually executed on executeTransaction, all other tests occur on testExecuteTransaction since only the bootloader can call the function


## executeTransactionFromOutside
*Assumes that validateTransaction and executeTransaction are called*

- should be callable from any address

