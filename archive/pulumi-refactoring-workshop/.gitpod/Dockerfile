FROM gitpod/workspace-full:latest

RUN curl -fsSL https://get.pulumi.com | sh -s -- --version 3.28.0 && \
    sudo -H /usr/bin/pip3 install pulumi_azure_native pylint black && \
    pip3 install pulumi_azure_native pylint black && \
    curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

RUN sed -i 's/export PIP_USER=yes/export PIP_USER=no/g' /home/gitpod/.bashrc

ENV PATH="${PATH}:/home/gitpod/.pulumi/bin"
ENV PIP_USER=no
