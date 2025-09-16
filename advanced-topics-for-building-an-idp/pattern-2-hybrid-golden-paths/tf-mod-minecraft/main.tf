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
  sudo yum update -y
  sudo yum install -y tmux java-21-amazon-corretto-headless

  cd /home/ec2-user
  mkdir -p minecraft logs
  cd minecraft

  if [ ! -f "server.jar" ]; then
    # Download Minecraft server using the version API
    URL=$(curl -s https://java-version.minectl.ediri.online/binary/${var.minecraft_version})
    curl -sLSf $URL > server.jar
    echo "eula=true" > eula.txt
    echo -e "#!/bin/bash\ncd /home/ec2-user/minecraft\njava -Xmx${var.java_max_memory}M -Xms${var.java_max_memory}M -jar server.jar nogui" > start.sh
    chmod +x start.sh
    chown -R ec2-user:ec2-user /home/ec2-user
  fi

  # Start Minecraft server in tmux session
  sudo -u ec2-user tmux new-session -d -s minecraft "/home/ec2-user/minecraft/start.sh"
  EOF

  tags = {
    Name = "tf-${var.name}"
  }
}

resource "aws_security_group" "minecraft_sg" {
  name        = "${var.name}-sg"
  description = "Allows Minecraft Access"

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
