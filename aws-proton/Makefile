default: .templates/environment-vpc.tar.gz

.templates:
	mkdir .templates

.templates/environment-vpc.tar.gz: .templates proton-templates/environment-vpc/v1/*
	tar -czvf .templates/environment-vpc.tar.gz -C proton-templates/environment-vpc/v1 .

clean:
	rm -rf .templates