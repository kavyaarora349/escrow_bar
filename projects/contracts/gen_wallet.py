from algosdk import account, mnemonic
import os

private_key, address = account.generate_account()
m = mnemonic.from_private_key(private_key)

with open('.env', 'w') as f:
    f.write(f'DEPLOYER_MNEMONIC="{m}"\n')
    
print("Wrote .env with new account mnemonic. Address:", address)
