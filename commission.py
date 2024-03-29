from fastapi import APIRouter, Path, HTTPException, status
from model import Commission, CommissionRequest
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

commission_router = APIRouter()

commission_list = []
max_id: int = 0


@commission_router.post("/commissions", status_code=status.HTTP_201_CREATED)
async def add_commission(commission: CommissionRequest) -> dict:
    global max_id
    max_id += 1  # auto increment ID

    newCommission = Commission(
        id=max_id,
        title=commission.title,
        description=commission.description,
        status=commission.status,
        width=commission.width,
        color=commission.color,
        date=commission.date,
    )
    commission_list.append(newCommission)
    json_compatible_item_data = newCommission.model_dump()
    return JSONResponse(json_compatible_item_data, status_code=status.HTTP_201_CREATED)


@commission_router.get("/commissions")
async def get_commissions() -> dict:
    json_compatible_item_data = jsonable_encoder(commission_list)
    return JSONResponse(content=json_compatible_item_data)


@commission_router.get("/commissions/{id}")
async def get_commission_by_id(id: int = Path(..., title="default")) -> dict:
    for commission in commission_list:
        if commission.id == id:
            return {"commission": commission}

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"The commission with ID={id} is not found.",
    )


@commission_router.put("/commissions/{id}")
async def update_commission(commission: CommissionRequest, id: int) -> dict:
    for x in commission_list:
        if x.id == id:
            x.title = commission.title
            x.description = commission.description
            x.status = commission.status
            x.width = commission.width
            x.color = commission.color
            x.date = commission.date
            return {"message": "Commission updated successfully"}

    return {"message": f"The commission item with ID={id} is not found."}


@commission_router.delete("/commissions/{id}")
async def delete_commission(id: int) -> dict:
    for i in range(len(commission_list)):
        commission = commission_list[i]
        if commission.id == id:
            commission_list.pop(i)
            return {"message": f"The commission item with ID={id} has been deleted."}

    return {"message": f"The commission item with ID={id} is not found."}
