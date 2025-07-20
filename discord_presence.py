import os
from datetime import timedelta
from pypresence import Presence
import atexit

CLIENT_ID = os.getenv("DISCORD_CLIENT_ID", "1396532681990340650")
LARGE_IMAGE_KEY = "water"

try:
    rpc = Presence(CLIENT_ID)
    rpc.connect()
except Exception as e:
    print(f"[Discord RPC] Could not connect: {e}")
    rpc = None

def format_time(seconds):
    return str(timedelta(seconds=seconds))

def update_status(seconds_left):
    if rpc:
        try:
            rpc.update(
                details="Staying healthy with WIP",
                state=f"Next drink in {format_time(seconds_left)}",
                large_image=LARGE_IMAGE_KEY,
                large_text="Staying healthy with WIP"
            )
        except Exception:
            pass

def clear_status():
    if rpc:
        try:
            rpc.clear()
            rpc.close()
        except Exception:
            pass

atexit.register(clear_status)
