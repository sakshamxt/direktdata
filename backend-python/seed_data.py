import os
import random
from datetime import datetime, timedelta
from dotenv import load_dotenv
from faker import Faker
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Load environment variables
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

# Initialize Faker and Database connection
fake = Faker()
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()

# Configuration
NUM_USERS = 1000
NUM_PRODUCTS = 200
NUM_ORDERS = 5000
CATEGORIES = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books']

def seed_database():
    print("Starting database seeding process...")
    
    # 1. Seed Users
    print(f"Generating {NUM_USERS} users...")
    users_data = []
    for _ in range(NUM_USERS):
        users_data.append({
            "id": fake.uuid4(),
            "name": fake.name(),
            "email": fake.unique.email(),
            "signup_date": fake.date_time_between(start_date='-2y', end_date='now')
        })
    session.execute(text("""
        INSERT INTO users (id, name, email, signup_date) 
        VALUES (:id, :name, :email, :signup_date)
    """), users_data)
    
    # 2. Seed Products
    print(f"Generating {NUM_PRODUCTS} products...")
    products_data = []
    for _ in range(NUM_PRODUCTS):
        products_data.append({
            "id": fake.uuid4(),
            "name": fake.commerce_product_name() if hasattr(fake, 'commerce_product_name') else fake.word().capitalize(),
            "category": random.choice(CATEGORIES),
            "price": round(random.uniform(10.0, 1500.0), 2)
        })
    session.execute(text("""
        INSERT INTO products (id, name, category, price) 
        VALUES (:id, :name, :category, :price)
    """), products_data)

    # 3. Seed Orders & Order Items
    print(f"Generating {NUM_ORDERS} orders and their items...")
    user_ids = [u['id'] for u in users_data]
    product_refs = {p['id']: p['price'] for p in products_data}
    product_ids = list(product_refs.keys())
    
    orders_data = []
    order_items_data = []
    
    for _ in range(NUM_ORDERS):
        order_id = fake.uuid4()
        user_id = random.choice(user_ids)
        # Randomize order date to create trends
        order_date = fake.date_time_between(start_date='-1y', end_date='now')
        
        orders_data.append({
            "id": order_id,
            "user_id": user_id,
            "order_date": order_date,
            "status": random.choices(['completed', 'pending', 'cancelled'], weights=[80, 15, 5])[0]
        })
        
        # 1 to 5 items per order
        num_items = random.randint(1, 5)
        for _ in range(num_items):
            prod_id = random.choice(product_ids)
            order_items_data.append({
                "id": fake.uuid4(),
                "order_id": order_id,
                "product_id": prod_id,
                "quantity": random.randint(1, 4),
                "unit_price": product_refs[prod_id]
            })

    session.execute(text("""
        INSERT INTO orders (id, user_id, order_date, status) 
        VALUES (:id, :user_id, :order_date, :status)
    """), orders_data)
    
    session.execute(text("""
        INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) 
        VALUES (:id, :order_id, :product_id, :quantity, :unit_price)
    """), order_items_data)

    # Commit all transactions
    session.commit()
    print("Database seeding completed successfully! 🎉")

if __name__ == "__main__":
    try:
        seed_database()
    except Exception as e:
        session.rollback()
        print(f"An error occurred: {e}")
    finally:
        session.close()