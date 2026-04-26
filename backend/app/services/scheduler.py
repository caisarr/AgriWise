import asyncio
from apscheduler.schedulers.background import BackgroundScheduler
from app.services.price_service import fetch_and_update_prices

scheduler = BackgroundScheduler()

def run_price_update():
    asyncio.run(fetch_and_update_prices())

def start_scheduler():
    # Update harga setiap 6 jam
    scheduler.add_job(run_price_update, "interval", hours=6, id="price_update")
    scheduler.start()
    print("[Scheduler] Cron harga aktif — update setiap 6 jam")
