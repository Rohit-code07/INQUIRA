from agents import build_search_agent, build_reader_agent,writer_chain, critic_prompt

def run_search_pipeline(topic: str)-> dict:
  state = {}
  research_agent = build_search_agent()
  #step 1
  print("\n"+"="*50)
  print("Search Agent is working...")
  search_results = research_agent.invoke({
    "messages": [
        {
            "role": "user",
            "content": f"Conduct a comprehensive web search on the topic: '{topic}'. Provide a summary of the most relevant findings, including key points and sources."
        }
    ]
})
  state['search_results'] = search_results["messages"][-1].content
  print("Search Results:", state['search_results'])

  #step 2
  print("\n"+"="*50)
  print("Reader Agent is working...")
  reader_agent = build_reader_agent()

  reader_result = reader_agent.invoke({
    "messages": [(
      "user",
      f"""
      Based on the following search results about '{topic}',
      identify the most relevant URL and scrape it for deeper content.

      Focus on:
      - Relevant and authoritative sources
      - Important facts and key findings
      - Useful evidence and statistics
      - Source credibility

      Avoid irrelevant, duplicate, or low-quality sources.

      Search Results:
      {state['search_results'][:800]}
      """
    )]
  })

  state['reader_result'] = reader_result["messages"][-1].content
  print("Reader Result:", state['reader_result'])

  #step 3 writer Chain
  print("\n"+"="*50)
  print("Writer Agent is working...")
  Reasearch_Combined = (f"Search Results:\n{state['search_results']}\n\n"
                        f"Reader Result:\n{state['reader_result']}\n")

  state["report"] = writer_chain.invoke({
    "query": topic,
    "research_findings": Reasearch_Combined
  })
  print("Final Report:", state["report"])

  
  #step 4 critic report
  print("\n"+"="*50)
  print("Critic Agent is working...")
  state["critic_feedback"] = critic_prompt.invoke({
    "research_report": state["report"]
  })
  print("\n Critic report \n ",state["critic_feedback"])
  return state 

if __name__ == "__main__":
  topic = input("Enter the topic to research: ")
  run_search_pipeline(topic)
