FROM python:latest
MAINTAINER Adrien Luxey <adrien.luxey@irisa.fr>

WORKDIR /usr/src/app

COPY . .
RUN pip install -r requirements.txt

EXPOSE 80

# -u:  Force stdin, stdout and stderr to be totally unbuffered. 
# Might help get output from flask

# Call the wrapper, that calls main.py itself
CMD ["python", "-u", "main.py"]
