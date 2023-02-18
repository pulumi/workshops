#!/bin/bash

aws proton create-environment-template --name vpc
aws proton create-environment-template-version \
  --template-name vpc \
  --source 