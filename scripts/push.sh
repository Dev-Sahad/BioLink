#!/bin/bash
  set -e
  cd /home/runner/workspace
  TOKEN="$GITHUB_PERSONAL_ACCESS_TOKEN"
  REMOTE="https://${TOKEN}@github.com/Dev-Sahad/BioLink.git"
  git remote set-url origin "$REMOTE"
  git push origin main
  