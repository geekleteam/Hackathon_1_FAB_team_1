from logging import getLogger
import boto3
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.responses import HTMLResponse
from llm import get_response_from_llm
from fastapi.middleware.cors import CORSMiddleware
import re
from env import aws_access_key_id, aws_secret_access_key

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

# Fix the region_name -> us-west-2
bedrock = boto3.client(service_name="bedrock-runtime",
    region_name="us-west-2",
    aws_access_key_id=aws_access_key_id,
    aws_secret_access_key=aws_secret_access_key
)


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


# Sample prompts data
prompts = [
    {
        "id": 1,
        "text": "Provide tech stack solutions for IoT Home Automation development",
        "response": "Sure! Here are some tech stacks you can consider...",
    },
    {
        "id": 2,
        "text": "Suggest an Authentication solution and evaluate it on a High, Medium, or Low scale",
        "response": "I can present tables in markdown format, which is commonly used in documentation and can be easily rendered in many platforms. Here's an example",
    },
]

@app.get("/api/prompts/{id}")
def get_prompt(id: int):
    try:
        prompt = next((p for p in prompts if p["id"] == id), None)
        if prompt is None:
            raise HTTPException(status_code=404, detail="Prompt not found")
        return prompt
    except Exception as e:
        logger.error(f"Error fetching prompt: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error fetching prompt: {str(e)}"
        )


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
        
        def format_paragraph(para):
            lines = para.split('\n')
            formatted_text = ""

            for line in lines:
                if line.strip().startswith("Step"):
                    formatted_text += f'<p style="margin-left: 20px;"><strong>{line.strip()}</strong></p>'
                    continue
                
                # Remove leading whitespace before processing
                line = line.strip()
                
                match = re.match(r"(\d+\.|[a-z]\.|[ivxlc]+\.)\s*(.*)", line)
                if match:
                    prefix = match.group(1)
                    content = match.group(2)
                    if re.match(r"\d+\.", prefix):
                        indent_level = 1
                    elif re.match(r"[a-z]\.", prefix):
                        indent_level = 2
                    elif re.match(r"[ivxlc]+\.", prefix):
                        indent_level = 3
                    else:
                        indent_level = 4
                else:
                    prefix = ""
                    content = line
                    indent_level = 4

                # Use a single space after the opening curly brace for consistency
                indent_style = f"margin-left: {20 * indent_level}px;"
                formatted_text += f'<p style="{indent_style}">{prefix} {content}</p>'


            return formatted_text

        # Split the response into paragraphs
        generated_solution_paragraphs = result[0].split('\n\n')

        # Create HTML paragraphs with proper indentation
        generated_solution_html = ''.join(format_paragraph(para) for para in generated_solution_paragraphs if para.strip())

        html_response = f"""<html><head><title>Generated Solution</title></head><body><h1>Generated Solution</h1>{''.join(format_paragraph(para) for para in generated_solution_paragraphs if para.strip())}</body></html>"""
        return {
            "response":  HTMLResponse(content=html_response),
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
