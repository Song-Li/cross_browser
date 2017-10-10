FROM mysql:latest
MAINTAINER Adrien Luxey <adrien.luxey@irisa.fr>

# Scripts in /docker-entrypoint-initdb.d are executed by the MySQL instance
# .sql files are executed on the database created with the MYSQL_DATABASE env. variable
ADD database_schema.sql /docker-entrypoint-initdb.d
