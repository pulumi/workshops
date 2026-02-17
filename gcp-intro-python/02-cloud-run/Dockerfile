FROM python:3.12-slim

WORKDIR /app

COPY requirements-app.txt .
RUN pip install -r requirements-app.txt

COPY app.py .
COPY text.txt .

EXPOSE 8080

CMD ["gunicorn", "--bind", "0.0.0.0:8080", "app:app"]
    