import openai
from prompt import SYSTEM_PROMPT
import requests
import os
import base64


def main():
    client = openai.OpenAI(api_key="OPEN_AI_KEY")  # Replace with your actual key

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": "Let's start building my dream bike!"}
    ]

    print("Welcome to the Dream Bike Builder!\n")

    while True:
        response = client.chat.completions.create(
            model="o4-mini",
            messages=messages
        )
        llm_message = response.choices[0].message.content.strip()
        print(f"\nAI: {llm_message}\n")

        if "<<END_OF_BIKE_SPEC>>" in llm_message:
            # Ask the LLM to summarize the specs for image generation
            messages.append({"role": "assistant", "content": llm_message})
            messages.append({
                "role": "user",
                "content": (
                    "Please summarize the above bike specification into a single, concise, and safe prompt (under 1000 characters) "
                    "suitable for an AI image generator. Only include the essential visual details and user choices. "
                    "Avoid any language that could violate content or safety policies."
                )
            })
            summary_response = client.chat.completions.create(
                model="o4-mini",
                messages=messages
            )
            final_prompt = summary_response.choices[0].message.content.strip()[:1000]
            print("\nFinal prompt for image generation:\n" + final_prompt + "\n")
            break

        user_input = input("Your answer: ").strip()
        messages.append({"role": "assistant", "content": llm_message})
        messages.append({"role": "user", "content": user_input})

    print("\nGenerating your custom bike image...")
    image_response = client.responses.create(
        model="gpt-4.1-mini",
        input=final_prompt,
        tools=[{"type": "image_generation"}],
    )
    image_data = [
        output.result
        for output in image_response.output
        if output.type == "image_generation_call"
    ]
    
    if not image_data:
        raise ValueError("No image data returned from API.")
    output_dir = "output"
    os.makedirs(output_dir, exist_ok=True)
    base_name = "custom_bike.png"
    image_path = os.path.join(output_dir, base_name)
    suffix = 1
    while os.path.exists(image_path):
        image_path = os.path.join(output_dir, f"custom_bike ({suffix}).png")
        suffix += 1
    with open(image_path, "wb") as f:
        f.write(base64.b64decode(image_data[0]))
    print(f"Image saved to {image_path}")

if __name__ == "__main__":
    main()
