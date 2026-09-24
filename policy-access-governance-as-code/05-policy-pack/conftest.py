"""Pytest bootstrap: make `rules.py` (this folder's root module) importable
from `tests/`, since this folder is a Pulumi policy pack project rather than
an installable Python package."""

import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
