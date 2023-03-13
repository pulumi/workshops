default: templates deploy

.templates:
	mkdir .templates

.templates/environment-vpc.tar.gz: .templates proton-templates/environment-vpc/v1/infrastructure/* .templates proton-templates/environment-vpc/v1/schema/* delete_node_modules
	tar -czvf .templates/environment-vpc.tar.gz -C proton-templates/environment-vpc/v1 .

.templates/service-container-vpc.tar.gz: .templates proton-templates/service-container/v1/infrastructure/* .templates proton-templates/service-container/v1/schema/* delete_node_modules
	tar -czvf .templates/service-container.tar.gz -C proton-templates/service-container/v1 .

# node_modules should not be included with the template bundles - they are
# restored during provisioning, and they will make the template exceed the
# maximum allowablw size anyway.
.PHONY: delete_node_modules
delete_node_modules:
	rm -rf proton-templates/environment-vpc/v1/infrastructure/node_modules && \
	rm -rf proton-templates/service-container/v1/infrastructure/node_modules

.PHONY: templates
templates: .templates/environment-vpc.tar.gz .templates/service-container-vpc.tar.gz

deploy:
	cd proton && pulumi up -y

.PHONY: clean
clean:
	rm -rf .templates