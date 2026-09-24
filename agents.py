from langchain.agents import create_agent   
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from tool import web_search,web_scraper
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
load_dotenv()
search_llm = ChatGroq(
    model="openai/gpt-oss-20b",
    temperature=0
)
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0
)

#1st agent
def build_search_agent():
    return create_agent(
        model=search_llm,
        tools=[web_search],
    )

#2nd agent
def build_reader_agent():
    return create_agent(
        model=llm,
        tools=[web_scraper],
    )

#writer prompt
writer_prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        """You are the Final Research Writer.

Your job is to produce a clear, accurate, and useful answer
based on the research findings and critic feedback.

Rules:
- Answer the original user query directly.
- Use the research findings as your primary evidence.
- Follow the critic's corrections.
- Do not invent facts, statistics, quotes, or sources.
- Do not include unsupported claims.
- Resolve contradictions when reliable evidence allows.
- If evidence is uncertain, clearly state the uncertainty.
- Remove irrelevant research details.
- Organize the answer with clear headings.
- Keep the writing concise but sufficiently detailed.
- Include relevant sources at the end.

Use this structure when appropriate:

# Answer

## Overview
Brief explanation.

## Key Findings
Important findings.

## Detailed Analysis
Detailed explanation.

## Comparison
Only if relevant.

## Advantages and Disadvantages
Only if relevant.

## Conclusion
Clear conclusion based on the evidence.

## Sources
Relevant sources used.

The final answer should read like a professional research report,
not like an internal AI workflow."""
    ),
    (
        "human",
        """Original User Query:
{query}

Research Findings:
{research_findings}

Write the final answer."""
    )
])

writer_chain = writer_prompt |llm | StrOutputParser()

critic_prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        """You are a Research Critic and Fact-Checking Agent.

Your job is to critically evaluate the research produced by
other research agents.

Check for:
- Unsupported claims
- Incorrect or questionable facts
- Contradictions between sources
- Missing important information
- Weak or unreliable sources
- Outdated information
- Irrelevant information
- Misinterpretation of sources
- Duplicate findings

For each issue, explain:
1. What the problem is.
2. Why it is a problem.
3. What should be corrected.

Return this structure:

## Overall Assessment
Brief assessment of research quality.

## Verified Findings
Findings that appear well supported.

## Issues Found
- Issue
- Evidence/reason
- Recommended correction

## Missing Information
Important information that should be researched.

## Source Quality
Assessment of source reliability.

## Final Recommendation
State whether the research is ready for final writing.

Do not invent corrections or facts.
If something cannot be verified, clearly say so."""
    ),
    (
        "human",
        """Research Report:
{research_report}
Review the research critically and identify problems that the
final writer should address."""
    )
])
critic_chain = critic_prompt | llm | StrOutputParser()