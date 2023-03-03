default: .templates/environment-vpc.tar.gz

.templates:
	mkdir .templates

.templates/environment-vpc.tar.gz: .templates proton-templates/environment-vpc/v1/infrastructure/* .templates proton-templates/environment-vpc/v1/schema/*
	tar -czvf .templates/environment-vpc.tar.gz -C proton-templates/environment-vpc/v1 .

deploy:
	cd proton && pulumi up -y

.PHONY: clean
clean:
	rm -rf .templates