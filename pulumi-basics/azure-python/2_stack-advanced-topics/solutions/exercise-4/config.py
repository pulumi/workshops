from pulumi import Config
from pulumi_tls import PrivateKey

## Exercise 4
## Move the config and statically created data into a "config.py" file to be imported and used elsewhere.
config = Config()
k8s_version = config.get('k8sVersion') or '1.19.11'
node_count = config.get_int('nodeCount') or 2
node_size = config.get('nodeSize') or 'Standard_D2_v2'
admin_username = config.require_secret('adminUserName') 

generated_key_pair = PrivateKey('ssh-key',
    algorithm='RSA', rsa_bits=4096)
ssh_public_key = generated_key_pair.public_key_openssh