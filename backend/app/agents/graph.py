import json
from typing import Any
from langgraph.graph import StateGraph, END
from typing_extensions import TypedDict


class AgentState(TypedDict):
    question: str; plan: str | None; retrieved_docs: list[dict] | None; critique: str | None; response: str | None; iteration: int


class LangGraphEngine:
    def __init__(self, rag_engine): self.rag = rag_engine; self.graph = self._build_graph()

    def _build_graph(self):
        builder = StateGraph(AgentState)
        builder.add_node("planner", self._planner)
        builder.add_node("retriever", self._retriever)
        builder.add_node("critic", self._critic)
        builder.add_node("response_generator", self._response_generator)
        builder.set_entry_point("planner")
        builder.add_edge("planner", "retriever")
        builder.add_edge("retriever", "critic")
        builder.add_conditional_edges("critic", self._decide_next, {"retrieve": "retriever", "respond": "response_generator"})
        builder.add_edge("response_generator", END)
        return builder.compile()

    async def _planner(self, state: AgentState) -> dict:
        return {"plan": json.dumps({"steps": ["keyword_search", "semantic_search", "metadata_filter"]})}

    async def _retriever(self, state: AgentState) -> dict:
        return {"retrieved_docs": await self.rag._retrieve(state["question"])}

    async def _critic(self, state: AgentState) -> dict:
        if len(state.get("retrieved_docs", [])) < 3 and state.get("iteration", 0) < 2:
            return {"critique": "insufficient", "iteration": state.get("iteration", 0) + 1}
        return {"critique": "sufficient"}

    def _decide_next(self, state: AgentState) -> str:
        return "retrieve" if state.get("critique") == "insufficient" else "respond"

    async def _response_generator(self, state: AgentState) -> dict:
        return {"response": await self.rag._generate(state["question"], state.get("retrieved_docs", []))}

    async def run(self, question: str) -> dict[str, Any]:
        return await self.graph.ainvoke({"question": question, "plan": None, "retrieved_docs": None, "critique": None, "response": None, "iteration": 0})
