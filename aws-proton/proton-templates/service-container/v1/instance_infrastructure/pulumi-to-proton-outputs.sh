#!/bin/bash

jq 'to_entries | map({key:.key, valueString:.value|tostring})' 