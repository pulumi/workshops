from dotenv import load_dotenv
from itertools import zip_longest

import streamlit as st
from st_chat_message import message

from llama_index_client import MessageRole
from llama_index.llms.bedrock import Bedrock
from llama_index.llms.bedrock.utils import ChatMessage
from llama_index.core import VectorStoreIndex,SimpleDirectoryReader
from llama_index.core.settings import Settings
import chromadb
from llama_index.embeddings.bedrock import BedrockEmbedding
from llama_index.core.text_splitter import SentenceSplitter
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.core.storage.storage_context import StorageContext
from llama_index.core.chat_engine.types import ChatMode

load_dotenv()

def load_text(path_to_pdfs):
    documents = SimpleDirectoryReader(path_to_pdfs).load_data()
    return documents

def load_embeddings():
    model = BedrockEmbedding(model="amazon.titan-embed-text-v1")
    return model

def load_llm():
    llm = Bedrock(model="mistral.mistral-large-2402-v1:0", region_name="us-east-1")
    return llm

def setting_the_indexing(llm, embed_model):
    Settings.llm = llm
    Settings.embed_model = embed_model
    Settings.node_parser = SentenceSplitter(chunk_size=1024, chunk_overlap=64)
    Settings.num_output = 256
    Settings.context_window = 4096
    Settings.chunk_size = 512
    Settings.chunk_overlap = 64

def setup_vector_database_and_create_vector_index(documents, collection_name):
    db = chromadb.PersistentClient(path="./chroma_db")

    chroma_collection = db.get_or_create_collection(collection_name)

    vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
    storage_context = StorageContext.from_defaults(vector_store=vector_store)

    vector_index = VectorStoreIndex.from_documents(documents=documents,
                                                   storage_context=storage_context
                                                   )
    
    return vector_index

st.set_page_config(page_title="Pulumi ChatBot - New York City Tour Guide", page_icon="🤖")
st.title("Pulumi ChatBot - New York City 🗽 Tour Guide")
st.info("""
        With AWS Bedrock, Embeddings, ChromaDB and LlamaIndex we have created a chatbot that can answer questions about New York City 🗽 based on the provided tour guides.
        """,
        icon="🤖")


if 'generated' not in st.session_state:
    st.session_state['generated'] = []  

if 'past' not in st.session_state:
    st.session_state['past'] = []  

if 'entered_prompt' not in st.session_state:
    st.session_state['entered_prompt'] = ""

documents = load_text(path_to_pdfs="./guides/")            
llm = load_llm()
embed_model = load_embeddings()
setting_the_indexing(llm=llm, embed_model=embed_model)
vector_index = setup_vector_database_and_create_vector_index(documents=documents,
                                                collection_name="tour-guides")
def build_message_list():
    zipped_messages = [ChatMessage(
        role=MessageRole.SYSTEM,
        content="""
        You are a knowledgable New York City guide talking with a human. If you do not know an answer, just say 'I don't know', do not make up an answer.
        """)]

    for human_msg, ai_msg in zip_longest(st.session_state['past'], st.session_state['generated']):
        if human_msg is not None:
            zipped_messages.append(ChatMessage(
                role=MessageRole.USER,
                content=human_msg)) 
        if ai_msg is not None:
            zipped_messages.append(
                ChatMessage(
                    role=MessageRole.ASSISTANT,
                    content=ai_msg))

    return zipped_messages


def generate_response():
    zipped_messages = build_message_list()
    chat_engine = vector_index.as_chat_engine(chat_mode=ChatMode.CONDENSE_QUESTION)
    ai_response = chat_engine.chat(st.session_state.entered_prompt,zipped_messages)
    return ai_response


def submit():
    st.session_state.entered_prompt = st.session_state.prompt_input
    st.session_state.prompt_input = ""


st.text_input('YOU: ', key='prompt_input', on_change=submit)


if st.session_state.entered_prompt != "":
    user_query = st.session_state.entered_prompt
    st.session_state.past.append(user_query)
    output = generate_response()
    st.session_state.generated.append(output.response)

if st.session_state['generated']:
    for i in range(len(st.session_state['generated'])-1, -1, -1):
        message(st.session_state["generated"][i], key=str(i),avatar_style='adventurer-neutral',seed="Pulumi")
        message(st.session_state['past'][i],
                is_user=True, key=str(i) + '_user',avatar_style='adventurer-neutral')

st.markdown("""
---
Made with ❤️ by [Pulumi](https://www.pulumi.com/)""")