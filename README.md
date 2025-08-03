# Build Yourself

Build Yourself is an interactive Python application that empowers users to design their dream vehicles—such as bikes, cars, and more—step by step, using an AI assistant. The current version focuses on building custom bikes, but the framework is designed to support other vehicle types in the future.

## Features

- Conversational, step-by-step customization of your dream vehicle (currently: bikes)
- Visual designer logic for collecting all essential details
- Supports both predefined and custom user inputs for each part
- Generates a summary prompt for AI image generation
- Saves a high-resolution image of your custom creation

## How It Works

1. The app starts a conversation, asking the user about their dream vehicle, one part at a time (type, handlebar, wheels, color, etc. for bikes).
2. For each part, the AI offers 5 standard options and a "Custom" option.
3. The conversation continues until all details are collected.
4. The AI summarizes the specification into a prompt for image generation.
5. The app generates and saves a photorealistic image of the custom vehicle.

## Directory Structure

```
build-yourself/
  bike/
    main.py         # Main application logic for bikes
    prompt.py       # System prompt and question logic for the AI (bike-specific)
    output/         # Generated images are saved here
  requirements.txt  # Python dependencies
```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd build-yourself
```

### 2. Create a Virtual Environment (Recommended)

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Set Up OpenAI API Key

- The code currently has a placeholder API key in `main.py`. **Replace it with your own OpenAI API key** for security and privacy.
- You can set your API key as an environment variable and update the code to read from it, or directly replace the string in the code.

### 5. Run the Application


```bash
cd bike
python main.py
```

### 6. Output

- The generated bike image will be saved as `output/custom_bike.png` inside the `bike/output/` directory.

## Notes

- Requires Python 3.7 or higher.
- Internet connection is required for OpenAI API access.
- The application uses the OpenAI API for both chat and image generation.
- All user choices and customizations are handled interactively in the terminal.

## Customization & Extensibility

- To modify the questions or options for bikes, edit `bike/prompt.py`.
- To add support for other vehicle types (e.g., cars), create a new module (e.g., `car/`) with its own `main.py` and `prompt.py`.
- To change output paths or image naming, edit the relevant section in the respective `main.py`.

## Future Scope

- Support for additional vehicle types (cars, trucks, etc.)
- Enhanced visual customization options
- Web or GUI interface
- User profile and design history

---

Let us know if you have ideas or want to contribute to expanding Build Yourself!