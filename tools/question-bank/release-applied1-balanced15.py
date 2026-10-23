"""Compatibility entrypoint; preserve index rows belonging to every other bank."""
import argparse
import subprocess
import sys
from pathlib import Path

parser=argparse.ArgumentParser()
parser.add_argument('--work-dir',default='.private-work/balanced15-20261024')
args=parser.parse_args()
subprocess.run([sys.executable,str(Path(__file__).with_name('release-balanced-practice.py')),
                '--bank','applied1-balanced15','--work-dir',args.work_dir],check=True)
