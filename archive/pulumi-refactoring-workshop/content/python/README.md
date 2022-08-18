# Refactoring Workshop

## Lab 1 - Deploy the base infrastructure

In this lab, we'll deploy the base infrastructure to refactor. The infrastructure is relatively simple, consisting of some network resources and an Azure AKS cluster

## Lab 2 - Use aliases to refactor in place

In this second lab, we'll refactor the project to move the network resources into a Pulumi component. We'll reparent these resources and use aliases to ensure the resources aren't recreated

## Lab 3 - Break apart projects

In this final lab, we'll migrate the cluster resource from the initial project to its own project. We'll then import the resource into the project so it is managed by a different project
