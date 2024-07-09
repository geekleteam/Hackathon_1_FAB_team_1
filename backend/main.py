from logging import getLogger

import boto3
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from llm import get_response_from_llm
from fastapi.middleware.cors import CORSMiddleware

logger = getLogger(__name__)
app = FastAPI()

origins = [
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# fix the region_name -> us-west-2
bedrock = boto3.client(service_name="bedrock-runtime", region_name="us-west-2")


class ModelKWArgs(BaseModel):
    modelParameter: dict = {
        "temperature": 0.75,
        "max_tokens": 2000,
        "top_p": 0.9,
    }


class SolutionsRequestModel(ModelKWArgs):
    userID: str
    requestID: str
    user_input: str
    filters: list
    model_id: str


class DetailedSolutionRequestModel(ModelKWArgs):
    userID: str
    requestID: str
    model_id: str
    user_input: str
    proposed_solution: str
    tech_stack: str


@app.post("/generate-solutions")
def generate_solutions(request: SolutionsRequestModel):
    try:
        result = get_response_from_llm(
            input_prompt=request.user_input,
            model_id=request.model_id,
            filters=request.filters,
            bedrock_client=bedrock,
            postprocess=True,
            model_kwargs=request.modelParameter,
        )
        return {
            "response": result[0],
            "original_response": result[1],
            "userID": request.userID,
            "requestID": request.requestID,
        }

    except Exception as e:
        logger.error(f"Error generating solutions: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error generating solutions: {str(e)}"
        )


@app.post("/generate-detailed-solution")
def generate_detailed_solution(request: DetailedSolutionRequestModel):
    try:
        result = get_response_from_llm(
            input_prompt=request.proposed_solution,
            history=[request.user_input],
            model_id=request.model_id,
            bedrock_client=bedrock,
            postprocess=False,
            model_kwargs=request.modelParameter,
        )
        return {
            "response": result[0],
            "original_response": result[1],
            "userID": request.userID,
            "requestID": request.requestID,
        }

    except Exception as e:
        logger.error(f"Error generating detailed solution: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error generating detailed solution: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
