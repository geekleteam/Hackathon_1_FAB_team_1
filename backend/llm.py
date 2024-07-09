import json
import re
from logging import getLogger
from typing import Optional, Union

import boto3
from langchain_aws import ChatBedrock

logger = getLogger(__name__)


def generate_prompt_for_solutions(
    user_input: str, filters: list, evaluating_formula: str
):

    prompt = f"""
        Given the user prompt: {user_input} and the static filters: {json.dumps(filters, indent=2)}

        Based on user input and static filters, recommend more than five solutions in the following format:
        Make sure to point all the important tech stacks, tools, and services that can be used to solve the problem.
        Attribute a score to each parameter: High (5), Medium (2), Low (1) for positive impact filters and High (-5), Medium (-2), Low (-1) for negative impact filters.
        Evaluate the solutions based on the following formula: Sum of all scores with positive impact minus Sum of all scores with negative impact.
        If the user prompt is not clear, respond with "Question Unclear".
        Else, only Provide the solutions as described below and no extra text. 
        
        Format:
        1.<A brief summary of the workflow>|<Tech Stack>|<filter1>|<filter2>|...|<Total Score>|<Final comments on the approach in short>|<Relevant Links>
        2. ...

        Here the filter are the keys of the static filters json provided.
        Only write the values of each filter <High/Medium/Low> and not the keys.
        Make sure each field is separated by a pipe (|) and each solution is separated by a new line.

        An Example just to explain format:
        1. Some Summary of workflow|Python, TechStack1|High|Medium|...|10|A really good approach|xyz.com, abc.com
    """
    return prompt


def generate_prompt_for_detailed_solutions(
    user_inputs: list[str], proposed_solution: str, tech_stack: str
):
    user_inputs = "".join(
        [f"{i+1}. {user_input}\n" for i, user_input in enumerate(user_inputs)]
    )
    prompt = f"""
        Given the user inputs: {user_inputs} and the proposed solution: {proposed_solution}
        Provide a detailed step-by-step solution with codes where necessary for the given details using the tech stack: {tech_stack}.
        Do not apologize and do not provide any extra information or text.
    """
    return prompt


def postprocess_result_with_filters(result: str, filters: list):
    print("Postprocessing result")
    if result == "Question Unclear":
        return {"error": "Question Unclear"}

    pattern = r"```(.*?)```"
    match = re.search(pattern, result, re.DOTALL)
    if match:
        result = match.group(1)
        expected_types = ["python", "json"]
        for expected_type in expected_types:
            if expected_type.startswith(expected_type):
                result = result[len(expected_type) :]
                break
    error_str = "Error parsing JSON response from LLM"
    error_result = {"error": error_str}
    try:
        return json.loads(result)
    except json.JSONDecodeError:
        logger.error(error_str)

    try:
        result = result[result.index("[") : result.rindex("]") + 1]
        return json.loads(result)
    except (ValueError, json.JSONDecodeError):
        logger.error(error_str)
    try:
        result = result[result.index("1.") :]
        results = result.splitlines()
        result = []
        keys = [
            "summary",
            "techStack",
            *filters,
            "totalScore",
            "totalScoreExplanation",
            "githubLinks",
        ]
        for i, solution in enumerate(results):
            # print(f"Solution: {i}", solution)
            # print()

            try:
                if len(solution) < 3:
                    continue
                solution = solution[2:].split("|")
                if len(solution) < len(keys):
                    print("Skipping")
                    continue
                solution_dict = dict()
                solution_dict["params"] = []
                solution_dict["additionalNotes"] = dict()
                for i, sol in enumerate(solution):
                    if keys[i] in filters:
                        solution_dict["params"].append({"name": keys[i], "value": sol})
                    elif keys[i] in ["githubLinks", "totalScoreExplanation"]:
                        solution_dict["additionalNotes"][keys[i]] = sol
                    else:
                        solution_dict[keys[i]] = sol
            except Exception as e:
                print(e)
                continue

            result.append(solution_dict)
        return result
    except Exception as e:
        logger.error(error_str + str(e))

    return error_result


def get_response_from_llm(
    input_prompt: str,
    model_id: str,
    bedrock_client: boto3.client,
    postprocess: bool = True,
    history: Optional[Union[list[str], str]] = None,
    filters: Optional[list] = None,
    evaluating_formula: Optional[str] = None,
    tech_stack: Optional[str] = None,
    model_kwargs: Optional[dict] = None,
):
    logger.info(f"Getting response from LLM with model_id: {model_id}")
    logger.info(f"Input prompt: {input_prompt}")
    logger.info(f"Filters: {filters}")
    logger.info(f"Evaluating formula: {evaluating_formula}")
    if history is None:
        processed_prompt = generate_prompt_for_solutions(
            input_prompt, filters, evaluating_formula
        )
    else:
        processed_prompt = generate_prompt_for_detailed_solutions(
            history, input_prompt, tech_stack
        )
    logger.info(f"Processed prompt: {processed_prompt}")
    print(processed_prompt)

    llm = ChatBedrock(
        model_id=model_id, client=bedrock_client, model_kwargs=model_kwargs
    )
    response = llm.invoke(processed_prompt)
    content = response.content
    original_response = content
    logger.info(f"Response from LLM: {content}")
    # print(content)

    # content = postprocess_result(content) if postprocess else content
    content = (
        postprocess_result_with_filters(content, filters=filters)
        if postprocess
        else content
    )

    return content, original_response


if __name__ == "__main__":
    import os
    import time

    os.environ["AWS_PROFILE"] = "yash-geekle"
    user_input = "I want to build a web application using Python and Django"
    model_id = "anthropic.claude-v2"
    model_id = "anthropic.claude-3-haiku-20240307-v1:0"
    filters = ["Scalability", "Cost", "Complexity"]
    evaluating_formula = "5 * filter1 + 2 * filter2"
    bedrock_client = boto3.client(
        service_name="bedrock-runtime", region_name="us-east-1"
    )
    tik = time.time()
    result = get_response_from_llm(
        input_prompt=user_input,
        model_id=model_id,
        filters=filters,
        evaluating_formula=evaluating_formula,
        bedrock_client=bedrock_client,
        model_kwargs={"max_tokens": 1000, "temperature": 0.9, "top_p": 0.9},
    )[0]

    with open("result.json", "w") as f:
        json.dump(result, f, indent=2)
    # result = get_response_from_llm(
    #     input_prompt="Use Flask + PostgreSQL + Gunicorn + Nginx",
    #     model_id="anthropic.claude-v2",
    #     bedrock_client=bedrock_client,
    #     postprocess=False,
    #     history=["I want to build a web application using Python and Django"],
    #     tech_stack="Flask, PostgreSQL, Gunicorn, Nginx",
    # )[0]
    # with open("result.txt", "w") as f:
    #     f.write(result)
    tok = time.time()
    print(result)
    print(f"Time taken: {tok - tik} seconds")
