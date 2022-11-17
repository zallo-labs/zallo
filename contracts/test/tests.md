# Tests

## constructor

_Assumed to only call upsertGroup_

## isValidSignature

- should return the magic value if the signature is valid
- should successfully valdiate the signature of a single approver
- should successfully validate the signature of multiple approvers
- should be reverted if the hash doesn't match the signature

## validateTransaction

_Assumes that isValidSignature_

- should revert when the transaction has already been executed

## executeTransaction

- should revert when not called by the bootloader[1]
- should successfully execute a transaction with a single approver
- should successfully execute a transaction with a multiple approvers
- should set the transaction as executed
- should emit the response to the tx
- should pass through the revert message if the called contract reverts with a message
- should revert if the called contract reverts

[1]: Only test actually executed on executeTransaction, all other tests occur on testExecuteTransaction since only the bootloader can call the function

## executeTransactionFromOutside

_Assumes that validateTransaction and executeTransaction are called_

- should be callable from any address

## upsertUser

- should successfully execute
- should emit event
- should generate the correct wallet merkle root
- should revert if called from an address other than the account

## removeUser

- should successfully execute & emit event
- should zero wallet's merkle root

## hasBeenExecuted

- should show an executed tx hash as being executed
- should not show an unexecuted tx as being executed

## merkle

- lib should generate valid multi-proof
- should generated valid merkle root
- should verify valid multi-proof
- should reject an invalid multi-proof
