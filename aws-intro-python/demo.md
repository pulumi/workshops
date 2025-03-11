## Demo

Here you will find all the steps to build the demo.

Pre-reqs:
```
logged into AWS (,aws-login)

```

## s3 Stuff

First let's start with a template:

```
> pulumi new --force
aws-python
( all defaults)
ca-central-1
```

Then look at files and update:

```
pulumi up
```

Add file to S3:
```
echo 'textfile!' > text.txt
```

Update code:

``` diff
# Create an AWS resource (S3 Bucket)
bucket = s3.BucketV2('my-bucket')

+with open("text.txt","r") as f:
+    content = f.read()

+obj = s3.BucketObject("my-text-file",
+    bucket=bucket.id,
+    content=content
+   )

# Export the name of the bucket
pulumi.export('bucket_name', bucket.id)

```

Run it and see the file:
```
pulumi up
echo "$(pulumi stack output bucket_name)"
aws s3 cp s3://$(pulumi stack output bucket_name)/my-text-file -
```

aws s3 gets the bucket name, gets the file and `-` prints to standard out.


## Lambda

enter the venv:

```
source ./venv/bin/activate
```

Add flask to requirements file, then install:

```
pip install -r requirements.txt
```

Create some files:

``` app.py
from flask import Flask, send_file

app = Flask(__name__)

@app.route("/")
def serve_file():
    return send_file("text.txt", mimetype="text/plain")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5005, debug=True)

```

Dockerfile:

```Dockerfile
# Use an official Python image
FROM python:3.10

# Set the working directory inside the container
WORKDIR /app

# Copy the application files into the container
COPY requirements.txt .
COPY app.py .
COPY text.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose the Flask app's port
EXPOSE 5005

# Run the Flask app
CMD ["python", "app.py"]

```

Run things:
```
docker build -t flask-textfile-app .
docker run -p 5005:5005 flask-textfile-app
```

## Lambda Infra

Add things:

```requirements.txt
+pulumi_awsx
```

```
>pip install -r requirements.txt
```


Docker login:
```
aws ecr get-login-password | docker login --username AWS --password-stdin $(pulumi stack output ecr)
docker build --platform=linux/amd64 -t flask-textfile-app -t $(pulumi stack output ecr):latest .
docker push $(pulumi stack output ecr):latest
```
