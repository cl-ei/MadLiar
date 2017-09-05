"""
Memcache API.

Provides memcached-alike API to application developers to store
data in memory when reliable storage via the DataStore API isn't
required and higher performance is desired.
"""

import redis
import pickle
from etc.config import REDIS_CONFIG

__all__ = ()
__host = REDIS_CONFIG.get("host", "localhost")
__port = REDIS_CONFIG.get("host", 6379)
__db = REDIS_CONFIG.get("db", 8)
connection = None
__namespace = "memcache"


def set(key, value, timeout):
    global connection
    if connection is None:
        connection = redis.Redis(host=__host, port=__port, db=__db)

    key = "%s_%s" % (__namespace, key)
    value = pickle.dumps(value)
    result = connection.set(key, value)
    if not result:
        return result

    return connection.expire(key, timeout) if timeout > 0 else result


def get(key):
    global connection
    if connection is None:
        connection = redis.Redis(host=__host, port=__port, db=__db)
    key = "%s_%s" % (__namespace, key)
    value = connection.get(key)
    return pickle.loads(value) if isinstance(value, (str, unicode)) else None


def delete(key):
    global connection
    if connection is None:
        connection = redis.Redis(host=__host, port=__port, db=__db)

    key = "%s_%s" % (__namespace, key)
    return connection.delete(key)
