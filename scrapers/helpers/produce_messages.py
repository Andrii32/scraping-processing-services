from typing import *
import uuid
from urllib.parse import urlparse

from confluent_kafka import Producer
from dataclasses import dataclass
from dataclasses_json import dataclass_json


KAFKA_BOOTSTRAP_SERVERS = 'localhost:9092'
KAFKA_PRODUCER_TOPIC = 'urls.web'
KAFKA_PRODUCER_FLUSH_TIMEOUT = 3

kafka_producer = Producer({'bootstrap.servers': KAFKA_BOOTSTRAP_SERVERS})


@dataclass_json()
@dataclass(eq=True, frozen=True)
class Message:
    id:      str
    hostId:  str
    url:     str


# generate messages
urls = [
    "https://httpbin.org/delay/10",
    "http://baddomain",
    "https://httpbin.org/status/200",
    "https://httpbin.org/status/200",
    "https://httpbin.org/status/200",
    "https://httpbin.org/status/300",
    "https://httpbin.org/status/400",
    "https://httpbin.org/status/500",
    "https://httpbin.org/status/999",
    "https://httpbin.org/relative-redirect/30"
]
messages: List[Message] = [
    Message(id=str(uuid.uuid5(namespace=uuid.NAMESPACE_URL, name=u)), url=u, hostId=urlparse(u).netloc)
    for u in urls
]

for msg in messages:
    kafka_producer.produce(
        topic=KAFKA_PRODUCER_TOPIC,
        value=msg.to_json().encode('utf-8'),
        key=msg.id.encode('utf-8')
    )
    print(
        {
            "key": msg.id,
            "value": msg.to_json()
        }
    )
v = kafka_producer.flush(KAFKA_PRODUCER_FLUSH_TIMEOUT)
if v != 0:
    raise Exception("Something went wrong")
