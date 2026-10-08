"""API regression checks on an isolated SQLite DB and an in-memory Redis substitute.
Does not connect to the user's PostgreSQL database.
"""
import asyncio
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]/'backend'))

import httpx
from sqlalchemy import event, select
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from app import models
from app.main import app, get_async_db, password_hash
import app.main as main

class MemoryRedis:
    def __init__(self): self.data = {}
    async def get(self, key): return self.data.get(key)
    async def setex(self, key, ttl, value): self.data[key] = value
    async def delete(self, key): self.data.pop(key, None)
    async def aclose(self): pass

async def run():
    engine=create_async_engine('sqlite+aiosqlite:///:memory:')
    @event.listens_for(engine.sync_engine, 'connect')
    def setup(connection, record):
        cursor=connection.cursor()
        cursor.execute("ATTACH DATABASE ':memory:' AS catalog")
        cursor.execute('PRAGMA foreign_keys=ON')
        cursor.close()
    async with engine.begin() as conn:
        await conn.run_sync(models.Base.metadata.create_all)
    factory=async_sessionmaker(engine, expire_on_commit=False)
    async def db_override():
        async with factory() as db: yield db
    app.dependency_overrides[get_async_db]=db_override
    main.redis_client=MemoryRedis()
    async with factory() as db:
        admin=models.User(username='admin', email='admin@deporte.ru', name='Admin', role='admin', password=password_hash.hash('admin'))
        old=models.User(username='old', email='old@example.com', name='Old', role='user', password='old-password')
        product=models.Product(id='1', title='Jersey', main_category='Форма сборных', country='Испания', year='2026', type='Домашняя', price_num=4900, price_str='4 900 ₽', image='spainfuria2026.png', image_hover='spain2furia2026.png')
        db.add_all([admin, old, product]); await db.commit()
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app),base_url='http://test') as client:
        data={'username':'new-person','email':'Person@Example.com','password':'abcd','name':'Person'}
        response=await client.post('/auth/register',json=data)
        assert response.status_code==201, response.text
        user_id=response.json()['id']
        async with factory() as db:
            user=await db.get(models.User,user_id)
            assert user.email=='person@example.com' and user.password.startswith('$argon2')
        print('PASS registration commits a real row, including email and password hash')
        assert (await client.post('/auth/register',json=data)).status_code==409
        assert (await client.post('/auth/register',json={**data,'username':'other','email':'person@example.com'})).status_code==409
        assert (await client.post('/auth/register',json={**data,'password':'x'})).status_code==422
        print('PASS duplicate username/email and short password are rejected')
        assert (await client.post('/auth/login',json={'username':'person@example.com','password':'wrong'})).status_code==401
        response=await client.post('/auth/login',json={'username':'person@example.com','password':'abcd'})
        assert response.status_code==200,response.text
        assert client.cookies.get('session_id')
        assert (await client.get('/auth/me')).json()['id']==user_id
        assert (await client.get('/users')).status_code==403
        assert (await client.post('/products',json={})).status_code in (403,422)
        assert (await client.delete('/products/1')).status_code==403
        print('PASS email login, session restoration, admin authorization')
        shopping=await client.put('/cart',json={'product_id':'1','size':'L','quantity':3})
        assert shopping.status_code==200,shopping.text
        assert shopping.json()['cart'][0]['quantity']==3 and shopping.json()['cart'][0]['size']=='L'
        favorite=await client.put('/favorites',json={'product_id':'1','enabled':True})
        assert favorite.status_code==200,favorite.text
        assert len(favorite.json()['favorites'])==1
        assert (await client.put('/favorites',json={'product_id':'1','enabled':True})).status_code==200
        restored=(await client.get('/shopping')).json()
        assert len(restored['favorites'])==1
        async with factory() as db:
            assert len((await db.scalars(select(models.CartItem).where(models.CartItem.user_id==user_id))).all())==1
            assert len((await db.scalars(select(models.Favorite).where(models.Favorite.user_id==user_id))).all())==1
        payload={'cart':[{'product_id':'1','size':'L','quantity':5}], 'favorites':['1']}
        first=await client.post('/shopping/import',json=payload)
        second=await client.post('/shopping/import',json=payload)
        assert first.status_code==200 and second.status_code==200,second.text
        assert second.json()['cart'][0]['quantity']==5 and len(second.json()['cart'])==1
        assert len(second.json()['favorites'])==1
        print('PASS persistent cart/favorites, unique rows, size and idempotent guest import')
        response=await client.post('/orders',json={'full_name':'Person','phone':'12345678','address':'Moscow', 'items':[{'product_id':'1','quantity':2,'size':'M'}]})
        assert response.status_code==201,response.text
        assert response.json()['total']=='9800.00'
        assert not (await client.get('/shopping')).json()['cart']
        async with factory() as db:
            order=await db.get(models.Order,response.json()['id'])
            assert order.user_id==user_id and len(order.items)==1
        assert (await client.post('/orders',json={'full_name':'Person','phone':'123','address':'Moscow','items':[]})).status_code==422
        print('PASS orders are persisted and totals are calculated from database prices')
        await client.post('/auth/logout')
        assert (await client.get('/auth/me')).status_code==401
        await client.post('/auth/login',json={'username':'old','password':'old-password'})
        async with factory() as db:
            legacy=await db.scalar(select(models.User).where(models.User.username=='old'))
            assert legacy.password.startswith('$argon2')
        print('PASS logout revokes session; legacy passwords upgrade on successful login')
        response=await client.post('/auth/login',json={'username':'admin','password':'admin'})
        assert response.status_code==200,response.text
        users=(await client.get('/users')).json()
        record=next(u for u in users if u['id']==user_id)
        assert 'Jersey' in record['order']
        assert all('password' not in u for u in users)
        admin_id=next(u['id'] for u in users if u['username']=='admin')
        assert (await client.delete('/users/'+admin_id)).status_code==400
        assert (await client.delete('/users/'+user_id)).status_code==200
        async with factory() as db:
            assert await db.get(models.User,user_id) is None
            assert not (await db.scalars(select(models.Order).where(models.Order.user_id==user_id))).all()
        print('PASS admin lists real rows/orders and deletion cascades to orders')
        product_payload={'title':'New jersey','main_category':'Форма сборных','country':None,'year':'2026','type':'Домашняя','price_num':1234.50,'price_str':'1 234,50 ₽','image':'spainfuria2026.png','image_hover':'spain2furia2026.png'}
        created=await client.post('/products',json=product_payload)
        assert created.status_code==201,created.text
        pid=created.json()['id']
        updated=await client.patch('/products/'+pid,json={'title':'Updated jersey','price_num':1500.25,'description':'Updated'})
        assert updated.status_code==200, updated.text
        assert (await client.delete('/products/'+pid)).status_code==200
        print('PASS admin product create/update/delete persist to database')
        assert not (await client.get('/shopping')).json()['favorites']
        await client.post('/auth/logout')
        guest={'email':'guest@example.com','password':'guest-password','full_name':'Guest Buyer',
               'phone':'12345678','address':'Moscow','items':[{'product_id':'1','quantity':1,'size':'XL'}]}
        created=await client.post('/orders/guest',json=guest)
        assert created.status_code==201,created.text
        result=created.json()
        guest_id=result['user']['id']
        assert result['credentials']['password']=='guest-password'
        assert (await client.get('/auth/me')).json()['id']==guest_id
        async with factory() as db:
            assert (await db.get(models.User,guest_id)).email=='guest@example.com'
            assert (await db.get(models.Order,result['id'])).user_id==guest_id
        await client.post('/auth/logout')
        response=await client.post('/auth/login',json={'username':'guest@example.com','password':'guest-password'})
        assert response.status_code==200,response.text
        assert response.json()['id']==guest_id
        await client.post('/auth/logout')
        duplicate=await client.post('/orders/guest',json=guest)
        assert duplicate.status_code==409,duplicate.text
        bad={**guest,'email':'bad@example.com','items':[{'product_id':'missing','quantity':1,'size':'M'}]}
        assert (await client.post('/orders/guest',json=bad)).status_code==400
        async with factory() as db:
            assert await db.scalar(select(models.User).where(models.User.email=='bad@example.com')) is None
        generated=await client.post('/orders/guest',json={**guest,'email':'generated@example.com','password':None})
        assert generated.status_code==201,generated.text
        assert len(generated.json()['credentials']['password'])>=12
        print('PASS guest checkout creates account/order/session, supports later login, rejects existing email')
    from app.catalog_seed import fill_catalog, demo_products
    async with engine.begin() as conn:
        count=await conn.run_sync(fill_catalog)
        assert count==120,count
        assert await conn.run_sync(fill_catalog)==120
    for product in demo_products():
        for field in ['image','image_hover']:
            assert (Path(__file__).resolve().parents[1]/'src/assets/images'/product[field]).exists(),product[field]
    print('PASS catalog reaches 120 real records, repeat seeding preserves count, all referenced images exist')
    await engine.dispose()
    print('ALL API CHECKS PASSED (SQLite + MemoryRedis; PostgreSQL migration not executed)')

asyncio.run(run())
