from prompt import SYSTEM_PROMPT
from utils import (
    get_openai_client, get_summary_prompt, generate_bike_image,
    save_image_to_file
)
import os

def _initialize_conversation():
    """Initialize the conversation with system prompt"""
    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": "Let's start building my dream bike!"}
    ]

def _get_llm_response(client, messages):
    """Get response from LLM"""
    response = client.chat.completions.create(
        model=os.getenv("OPENAI_CHAT_MODEL"),
        messages=messages
    )
    return response.choices[0].message.content.strip()

def _generate_summary_prompt(client, messages):
    """Generate summary prompt for image generation"""
    return get_summary_prompt(messages, client)

def _run_conversation_loop(client, messages):
    """Run the main conversation loop"""
    print("Welcome to the Dream Bike Builder!\n")
    
    while True:
        llm_message = _get_llm_response(client, messages)
        print(f"\nAI: {llm_message}\n")

        if "<<END_OF_BIKE_SPEC>>" in llm_message:
            messages.append({"role": "assistant", "content": llm_message})
            final_prompt = _generate_summary_prompt(client, messages)
            print("\nFinal prompt for image generation:\n" + final_prompt + "\n")
            return final_prompt

        user_input = input("Your answer: ").strip()
        messages.append({"role": "assistant", "content": llm_message})
        messages.append({"role": "user", "content": user_input})

def main():
    client = get_openai_client()
    messages = _initialize_conversation()
    
    final_prompt = _run_conversation_loop(client, messages)
    
    print("\nGenerating your custom bike image...")
    image_base64 = generate_bike_image(final_prompt, client)
    image_path = save_image_to_file(image_base64, "cli_session")
    print(f"Image saved to {image_path}")

if __name__ == "__main__":
    main()
