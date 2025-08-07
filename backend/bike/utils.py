import openai
import os
from typing import List, Dict
from dotenv import load_dotenv

load_dotenv()

# Model configuration from environment variables
CHAT_MODEL = os.getenv("OPENAI_CHAT_MODEL")
IMAGE_MODEL = os.getenv("OPENAI_IMAGE_MODEL")

# Function to extract summary prompt for image generation

def get_summary_prompt(messages: List[Dict], client) -> str:
    """
    Given the conversation history and OpenAI client, ask the LLM to summarize the bike spec for image generation.
    Returns a concise prompt (max 1000 chars).
    """
    # Add the summary request to the conversation
    summary_messages = messages.copy()
    summary_messages.append({
        "role": "user",
        "content": (
            "Please summarize the above bike specification into a single, concise, and safe prompt (under 1000 characters) "
            "suitable for an AI image generator. Only include the essential visual details and user choices. "
            "Avoid any language that could violate content or safety policies."
        )
    })
    response = client.chat.completions.create(
        model=CHAT_MODEL,
        messages=summary_messages
    )
    final_prompt = response.choices[0].message.content.strip()[:1000]
    return final_prompt

# Function to generate bike image using OpenAI and return base64 string

def generate_bike_image(prompt: str, client) -> str:
    """
    Given a summary prompt and OpenAI client, generate the image and return the base64 string.
    """
    image_response = client.responses.create(
        model=IMAGE_MODEL,
        input=prompt,
        tools=[{"type": "image_generation"}],
    )
    image_data = [
        output.result
        for output in image_response.output
        if output.type == "image_generation_call"
    ]
    if not image_data:
        raise ValueError("No image data returned from API.")
    return image_data[0]