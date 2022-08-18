from pulumi import export, Output
import pulumi_aws as aws
import json, hashlib

h = hashlib.new('sha1')
