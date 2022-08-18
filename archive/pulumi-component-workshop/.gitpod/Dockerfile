FROM gitpod/workspace-full:latest

RUN curl -fsSL https://get.pulumi.com | sh -s -- --version 3.0.0 && \
    sudo -H /usr/bin/pip3 install pulumi_kubernetes flask pulumi && \
    pip3 install pulumi_kubernetes flask pulumi && \
    curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" && \
    sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

RUN sed -i 's/export PIP_USER=yes/export PIP_USER=no/g' /home/gitpod/.bashrc

ENV PATH="${PATH}:/home/gitpod/.pulumi/bin"
ENV PIP_USER=no
