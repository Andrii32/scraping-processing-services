
# Scraping / data processing

## Elasticksearch, Kibana

Start elasticsearch stack:

    docker-compose -f docker-compose.elk.yml up

## Elastic Beats

Start beats:

    docker-compose -f docker-compose.beats.yml up

### Metricbeat

To make metricbeat able access /var/run/docker.sock its container is running with user: root.
Due to this elk/metricbeat/config/metricbeat.yml have to be owned by root.

    sudo chown root elk/metricbeat/config/metricbeat.yml

Major version upgrade:\
Copy dashboards from container (with nev version) into kibana-default folder.\

    docker cp [OPTIONS] CONTAINER:SRC_PATH DEST_PATH

    docker cp scrapers-infrastructure_metricbeat_1:/usr/share/metricbeat/kibana/ ./elk/metricbeat/kibana-default

Copy chosen dashboards into kibana-custom

### Packetbeat

Major version upgrade\
Copy dashboards from container (with nev version) into kibana-default folder.\

    docker cp [OPTIONS] CONTAINER:SRC_PATH DEST_PATH

    docker cp scrapers-infrastructure_packetbeat_1:/usr/share/packetbeat/kibana/ ./elk/packetbeat/kibana-default

Copy chosen dashboards into kibana-custom

### Filebeat

Major version upgrade
Copy dashboards from container (with nev version) into kibana-default folder.\

    docker cp [OPTIONS] CONTAINER:SRC_PATH DEST_PATH

    docker cp scrapers-infrastructure_filebeat_1:/usr/share/filebeat/kibana/ ./elk/filebeat/kibana-default

Copy chosen dashboards into kibana-custom

Export custom dashboards from kibana:

    # connect to container
    docker-compose -f docker-compose.beats.yml exec filebeat /bin/bash

    # export dashboard by id
    filebeat export dashboard -id <DASHBOARD_ID> >> /usr/share/filebeat/kibana/custom/<MAJOR_VERSION>/dashboard/<FILENAME>.json
    # example
    filebeat --strict.perms=false export dashboard -id 4580bc70-0e1c-11eb-b340-5b5a755d02d8 >> /usr/share/filebeat/kibana/custom/7/dashboard/scrapers.json

    # docs: https://www.elastic.co/guide/en/beats/devguide/current/export-dashboards.html

## MinIO

Configuration for one volume:

    command: server /data
    volumes:
      - ./minio/data:/data

Configuration for multiple volumes:

    command: server /data1 /data2 /data3 /data4
    volumes:
      - ./minio/data1:/data1
      - ./minio/data2:/data2
      - ./minio/data3:/data3
      - ./minio/data4:/data4

Start minio:

    docker-compose -f docker-compose.minio.yml up

## Kafka

Start kafka:

    docker-compose -f docker-compose.kafka.yml up


## Postgres

Start postgres:

    docker-compose -f docker-compose.postgres.yml up