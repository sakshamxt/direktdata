import os
import json
from dotenv import load_dotenv
from database import engine
from langchain_community.utilities import SQLDatabase
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.agent_toolkits import create_sql_agent
from langchain_core.prompts import PromptTemplate

load_dotenv()

# 1. Connect LangChain to our database engine
db = SQLDatabase(engine)

# 2. Initialize the Gemini LLM
# We use temperature=0 because we want analytical precision, not creative hallucination.
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash", 
    temperature=0,
    google_api_key=os.getenv("GOOGLE_API_KEY")
)

# 3. Create the SQL Agent
# This agent automatically knows your schema and can execute queries securely.
sql_agent = create_sql_agent(
    llm=llm,
    db=db,
    agent_type="tool-calling",
    verbose=True, # Prints the AI's thought process to your terminal
    handle_parsing_errors=True
)

# 4. The UI Formatter Prompt
# This tells the AI exactly how to structure the output for React's Recharts.
formatter_prompt = PromptTemplate.from_template(
    """
    You are an expert frontend developer and data analyst.
    The user asked this question: "{user_query}"
    
    The database returned this raw data: 
    "{raw_data}"
    
    Your job is to format this data for the Recharts library in React.
    Decide whether a 'BarChart', 'LineChart', or 'PieChart' is most appropriate for this data.
    
    Return ONLY a valid JSON object with the following strict structure, and absolutely no markdown formatting or backticks:
    {{
        "chartType": "BarChart | LineChart | PieChart",
        "data": [ array of objects representing the data points ],
        "xAxisKey": "the string key for the x-axis",
        "yAxisKey": "the string key for the y-axis (or value for PieChart)",
        "summary": "A 1-2 sentence text summary answering the user's question directly based on the data."
    }}
    """
)

def process_user_query(user_query: str) -> dict:
    """
    The main agentic loop.
    """
    print(f"\n--- Processing Query: {user_query} ---")
    
    try:
        # Step A: Let the SQL Agent find the data
        print("1. Agent is analyzing schema and writing SQL...")
        agent_response = sql_agent.invoke({"input": user_query})
        raw_data = agent_response.get("output", "")
        
        # Step B: Format the raw data into UI-ready JSON
        print("2. Formatting raw data into Recharts JSON...")
        formatting_chain = formatter_prompt | llm
        json_string_response = formatting_chain.invoke({
            "user_query": user_query,
            "raw_data": raw_data
        }).content
        
        # Clean the output in case the LLM wrapped it in markdown code blocks
        clean_json_string = json_string_response.strip().removeprefix("```json").removesuffix("```").strip()
        
        final_ui_config = json.loads(clean_json_string)
        print("3. Pipeline complete! Returning Generative UI config.")
        
        return final_ui_config

    except Exception as e:
        print(f"Error in agentic loop: {e}")
        return {
            "error": "The AI encountered an issue processing your request.",
            "details": str(e)
        }