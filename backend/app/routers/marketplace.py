from fastapi import APIRouter, HTTPException
from typing import Optional, List
from pydantic import BaseModel
from app.services.supabase_service import supabase

router = APIRouter(prefix="/api/marketplace", tags=["marketplace"])

class ProductCreate(BaseModel):
    seller_name: str
    seller_phone: str
    title: str
    description: str
    price: int
    stock: int
    unit: str
    category: str
    location: str
    image_url: Optional[str] = None

@router.get("/")
def get_products(category: Optional[str] = None, q: Optional[str] = None):
    query = supabase.table("marketplace_products").select("*").order("created_at", desc=True)
    
    if category:
        query = query.eq("category", category)
    if q:
        query = query.ilike("title", f"%{q}%")
        
    res = query.execute()
    return {"products": res.data}

@router.post("/")
def create_product(product: ProductCreate):
    try:
        data = product.dict()
        res = supabase.table("marketplace_products").insert(data).execute()
        if not res.data:
            raise HTTPException(status_code=400, detail="Gagal menyimpan produk")
        return {"status": "success", "product": res.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{product_id}")
def get_product(product_id: str):
    res = supabase.table("marketplace_products").select("*").eq("id", product_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Produk tidak ditemukan")
    return {"product": res.data[0]}
