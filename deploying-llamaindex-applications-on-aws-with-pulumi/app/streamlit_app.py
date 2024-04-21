from dotenv import load_dotenv
from itertools import zip_longest

from llama_index_client import MessageRole
import streamlit as st
from st_chat_message import message

from llama_index.llms.bedrock import Bedrock
from llama_index.llms.bedrock.utils import ChatMessage
from llama_index.core import ChatPromptTemplate

load_dotenv()

st.set_page_config(page_title="Pulumi ChatBot", page_icon="🤖")
st.title("Pulumi ChatBot")
st.info("With AWS Bedrock and LlamaIndex support!",icon="🤖")


if 'generated' not in st.session_state:
    st.session_state['generated'] = []  

if 'past' not in st.session_state:
    st.session_state['past'] = []  

if 'entered_prompt' not in st.session_state:
    st.session_state['entered_prompt'] = ""

chat = Bedrock(
    model="amazon.titan-text-express-v1"
)

def build_message_list():
    zipped_messages = [ChatMessage(
        role=MessageRole.SYSTEM,
        content="""
        You are a power Pulumi Infrastructure as Code assistant talking with a human. If you do not know an answer, just say 'I don't know', do not make up an answer.
        """)]

    for human_msg, ai_msg in zip_longest(st.session_state['past'], st.session_state['generated']):
        if human_msg is not None:
            zipped_messages.append(ChatMessage(
                role=MessageRole.USER,
                content=human_msg)) 
        if ai_msg is not None:
            zipped_messages.append(
                ChatMessage(
                    role=MessageRole.CHATBOT,
                    content=ai_msg))

    return zipped_messages


def generate_response():
    zipped_messages = build_message_list()
    ai_response = chat.chat(zipped_messages)
    return ai_response


def submit():
    st.session_state.entered_prompt = st.session_state.prompt_input
    st.session_state.prompt_input = ""


st.text_input('YOU: ', key='prompt_input', on_change=submit)


if st.session_state.entered_prompt != "":
    user_query = st.session_state.entered_prompt
    st.session_state.past.append(user_query)
    output = generate_response()
    st.session_state.generated.append(output.message.content)

if st.session_state['generated']:
    for i in range(len(st.session_state['generated'])-1, -1, -1):
        message(st.session_state["generated"][i], key=str(i),avatar_style='adventurer-neutral',seed="Pulumi")
        message(st.session_state['past'][i],
                is_user=True, key=str(i) + '_user',avatar_style='adventurer-neutral')

st.markdown("""
---
Made with ❤️ by [Pulumi](https://www.pulumi.com/)""")