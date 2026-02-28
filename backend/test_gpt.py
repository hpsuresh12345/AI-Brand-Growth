import asyncio
from app.services.claude_service import call_claude

async def main():
    result = await call_claude("Say hello in exactly 5 words", max_tokens=50)
    print(f"GPT says: {result['content']}")
    print(f"Model: {result['model']}")

asyncio.run(main())
