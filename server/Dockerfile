FROM python:latest
MAINTAINER Adrien Luxey <adrien.luxey@irisa.fr>

WORKDIR /usr/src/app

COPY . .
RUN pip install -r requirements.txt

EXPOSE 80

# -u:  Force stdin, stdout and stderr to be totally unbuffered. 
# Should help get output from flask

# Call main directly through Flask
# ENV FLASK_APP main.py
# CMD ["python", "-um", "flask", "run", "--host=0.0.0.0"]

# Call the wrapper, that calls main.py itself
CMD ["python", "-u", "wrapper.py"]
