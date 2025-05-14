data "aws_ami" "amazon_linux" {
  owners = ["amazon"]
  most_recent = true

  filter {
    name = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }
}

resource "aws_key_pair" "minecraft_key_pair" {
  key_name = "my-key-pair"
  public_key = file(var.public_key_path)
}

resource "aws_instance" "minecraft_instance" {
  ami           = data.aws_ami.amazon_linux.id
  instance_type = var.instance_type
  key_name      = aws_key_pair.minecraft_key_pair.key_name
  security_groups = [aws_security_group.minecraft_sg.name]

  user_data = <<-EOF
  #!/bin/bash
  sudo yum update
  sudo yum install -y tmux java-21-amazon-corretto-headless
  if [ ! -f "server.jar" ]; then
    wget ${var.server_url} -O server.jar
    echo "eula=true" > eula.txt
    echo -e "#!/bin/bash\njava -Xmx${var.java_max_memory}M -Xms${var.java_max_memory}M -jar server.jar nogui" > start.sh
    chmod +x start.sh
  fi
  tmux new-session -d -s minecraft "./start.sh"
  EOF

  tags = {
    Name = "tf-${var.name}"
  }
}

resource "aws_security_group" "minecraft_sg" {
  name        = "${var.name}-sg"
  description = "Allows SSH and Minecraft Access"

  ingress {
    from_port = 22
    to_port   = 22
    protocol  = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port = 25565
    to_port   = 25565
    protocol  = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "tf-${var.name}-sg"
  }
}
